const express = require('express')
const cors = require('cors')
const port = 8080

const app = express()
app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
    res.json({ message: 'Message de prueba desde el backend' })
})

module.exports = app
