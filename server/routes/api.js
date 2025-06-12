import 'dotenv/config'
import express from 'express'
import jwt from 'jsonwebtoken'
import FolioCommunicator from '../folio/foliocommunicator.js'

const router = express.Router()

const jwtSecret = process.env.JWTSECRET
const users = JSON.parse(process.env.USERS)
const deniedGroups = process.env.DENIEDGROUPS

let folio = new FolioCommunicator(process.env.OKAPIURL, process.env.OKAPITENANT, process.env.OKAPIUSER, process.env.OKAPIPWD)


const verifyToken = (req, res, next) => {
  const token = req.cookies["token"] || req.headers['authorization'] || req.headers.authorization

  if(!token) {
    return res.status(403).send('A token is required')
  }
  
  try {
    // const decoded = jwt.verify(token.split(' ')[1], jwtSecret)
    const decoded = jwt.verify(token, jwtSecret)
    req.user = decoded
  } catch (error) {
    console.log(error.message);
    return res.status(403).send('A token is required')
  }
  return next()
}

router.post('/session/login', (req,res) => {
  try {
    const {username, password} = req.body

    if(!(username && password)) {
      res.status(400).send(`Missing parameters, ${req.body.username}, ${req.body.password}`)
    }
    if(username in users && users[username]==password) {
      let expires = Math.floor(Date.now() / 1000) + (4*60*60)
      let user = {username}
      const token = jwt.sign({user, exp: expires}, jwtSecret)
      user.token = token
      user.exp = expires
      res.status(200).json(user)
    } else {
      res.status(400).send('Invalid credentials!')
    }
  } catch (error) {
    console.log(error.message);
        
  }
})

router.get('/info', verifyToken, (req, res) => {

  // const token = res.locals.cookie['token']||req.body.token || req.query.token || req.headers['authorization']
  const token = req.headers['authorization']
  
  // console.log(req.headers)
  res.json(token || {token: 'Empty'})
  
})

router.get('/user/:barcode', verifyToken,  async (req, res) => {
  let barcode = req.params.barcode
  // console.log(barcode);
  
  try {
    let user = await folio.getUserWithBarcode(barcode)
    user.pwdReset = deniedGroups.includes(user.patronGroup)?false:true
    // console.log(JSON.stringify(user,0,2));
    
    res.json(user)
  } catch (error) {
    console.error("Something went wrong.", error.message)
    res.status(500).send(error.message)
  }
})

router.post('/user/changepin', verifyToken, async (req,res) => {
  let username = req.body.username
  let password = req.body.password

  console.log(username, password);
  

  try {
    const resp = await folio.updatePassword(username, password)
    res.send(resp)
  } catch (error) {
    console.log(error.message);
  }
  
})

router.get('/getPagingSlips', verifyToken, async (req,res) => {
  console.log('Fetching slips');
  
  try {
    let slips = await folio.getPagingSlips();
    console.log(slips.length);
    
    res.json(slips)
  } catch (error) {
    console.error(error.message)
  }
})

router.get('/getServicePoints', verifyToken, async (req,res) => {
  try {
    let sp = await folio.getServicePointsWithHoldShelf()
    res.json(sp)
  } catch (error) {
    console.error(error.message);
  }
})

router.get('/getShelfList/:id', verifyToken, async (req, res) => {
  const id = req.params.id
  try {
    let shelfList = await folio.getShelfList(id)
    res.json(shelfList)
  } catch (error) {
    console.error(error.message);
  }
})

export default router