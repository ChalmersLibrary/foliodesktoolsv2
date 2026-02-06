import express from 'express'
import api from './routes/api.js'
import cookieParser from 'cookie-parser'

const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json())
app.use(express.urlencoded({extended: true}))

app.use(cookieParser())

app.use((req, res, next) => {
  if (req.ip.includes('127.0.0.1') || req.ip.includes('::1') || (req.get('X-Forwarded-For') != undefined && req.get('X-Forwarded-For').includes('129.16'))) {
    next()
  } else {
    res.status(403).sendFile(`/app/public/403.html`)
  }
})

app.use('/api', api)
app.use(express.static('public'))

app.listen(PORT, () => {
  console.log(`Running server on port ${PORT}`)
})