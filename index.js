const express = require('express')
const cors = require('cors')
const port = 8080

const app = express()
app.use(cors)

app.get('/', req, res => {
    res.json({ message: 'Message de prueba desde el backend' })
})

app.listen(port, ()=>{
    console.log(`App listen on port ${port}`)
})
