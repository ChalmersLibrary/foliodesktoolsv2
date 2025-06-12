import express from 'express'
import api from './routes/api.js'
import cookieParser from 'cookie-parser'

const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json())
app.use(express.urlencoded({extended: true}))

app.use(cookieParser())

app.use('/api', api)
app.use(express.static('public'))

app.listen(PORT, () => {
  console.log(`Running server on port ${PORT}`)
})