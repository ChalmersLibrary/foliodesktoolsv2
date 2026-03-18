import 'dotenv/config'
import express from 'express'
import jwt from 'jsonwebtoken'
import saml2 from 'saml2-js'
import FolioCommunicator from '../folio/foliocommunicator.js'

const router = express.Router()

const jwtSecret = process.env.JWTSECRET
const staffGuid = process.env.STAFFGUID

const folio = new FolioCommunicator(process.env.OKAPIURL, process.env.OKAPITENANT, process.env.OKAPIUSER, process.env.OKAPIPWD)

function formatPEM(base64, type) {
  const lines = base64.replace(/\s/g, '').match(/.{1,64}/g).join('\n')
  return `-----BEGIN ${type}-----\n${lines}\n-----END ${type}-----`
}

async function fetchIdpConfig(metadataUrl) {
  const response = await fetch(metadataUrl)
  if (!response.ok) throw new Error(`Failed to fetch IdP metadata: ${response.status}`)
  const xml = await response.text()

  // Prefer HTTP-Redirect binding, fall back to any binding
  const ssoMatch =
    xml.match(/<[^>]*SingleSignOnService[^>]*Binding="[^"]*HTTP-Redirect[^"]*"[^>]*Location="([^"]+)"/) ||
    xml.match(/<[^>]*SingleSignOnService[^>]*Location="([^"]+)"/)

  const sloMatch =
    xml.match(/<[^>]*SingleLogoutService[^>]*Binding="[^"]*HTTP-Redirect[^"]*"[^>]*Location="([^"]+)"/) ||
    xml.match(/<[^>]*SingleLogoutService[^>]*Location="([^"]+)"/)

  const certMatches = [...xml.matchAll(/<[^>]*X509Certificate[^>]*>([\s\S]+?)<\/[^>]*X509Certificate>/g)]

  if (!ssoMatch) throw new Error('SSO URL not found in IdP metadata')
  if (!certMatches.length) throw new Error('Certificate not found in IdP metadata')

  return {
    sso_login_url: ssoMatch[1],
    sso_logout_url: sloMatch?.[1] || '',
    certificates: certMatches.map(m => formatPEM(m[1], 'CERTIFICATE')),
  }
}

const sp = new saml2.ServiceProvider({
  entity_id: process.env.SAML_SP_ENTITY_ID,
  private_key: formatPEM(process.env.SAML_KEY, 'PRIVATE KEY'),
  certificate: formatPEM(process.env.SAML_CERT, 'CERTIFICATE'),
  assert_endpoint: process.env.SAML_SP_ACS_URL,
  allow_unencrypted_assertion: true,
})

// Lazily fetched and cached IdP - retried on each request until successful
let idp = null

async function getIdp() {
  if (!idp) {
    const config = await fetchIdpConfig(process.env.SAML_IDP_METADATA_URL)
    idp = new saml2.IdentityProvider(config)
  }
  return idp
}

// SP Metadata - register this URL with your IdP
router.get('/metadata', (_req, res) => {
  res.type('application/xml')
  res.send(sp.create_metadata())
})

// Initiate SSO login - redirects browser to IdP
router.get('/login', async (req, res) => {
  try {
    const currentIdp = await getIdp()
    sp.create_login_request_url(currentIdp, {}, (err, loginUrl) => {
      if (err) {
        console.error('SAML login error:', err)
        return res.status(500).send('SAML configuration error')
      }
      res.redirect(loginUrl)
    })
  } catch (err) {
    console.error('SAML IdP metadata error:', err)
    res.status(500).send('Failed to load IdP configuration')
  }
})

// Assertion Consumer Service - IdP posts SAML response here via browser
router.post('/callback', async (req, res) => {
  try {
    const currentIdp = await getIdp()
    sp.post_assert(currentIdp, { request_body: req.body }, async (err, samlResponse) => {
      if (err) {
        console.error('SAML assertion error:', err)
        return res.status(403).send('SAML authentication failed')
      }

      const externalSystemId = samlResponse.user.attributes.username

      let folioUser
      try {
        folioUser = await folio.getUserByExternalSystemId(externalSystemId)
      } catch (folioErr) {
        console.error('FOLIO user lookup error:', folioErr)
        return res.status(500).send('User lookup failed')
      }
      if (!folioUser) {
        return res.status(403).send('No matching FOLIO user found')
      }
      
      if (folioUser.patronGroup !== staffGuid) {
        return res.status(403).send('Access denied: insufficient privileges')
      }

      const expires = Math.floor(Date.now() / 1000) + (4 * 60 * 60)
      const user = { username: folioUser.username }
      const token = jwt.sign({ user, exp: expires }, jwtSecret)

      res.cookie('token', token, { expires: new Date(expires * 1000) })
      res.redirect('/')
    })
  } catch (err) {
    console.error('SAML IdP metadata error:', err)
    res.status(500).send('Failed to load IdP configuration')
  }
})

export default router
