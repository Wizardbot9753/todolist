const express = require('express')
const cors = require('cors')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
// const dotenv = require('dotenv')
const { pool } = require("./config/db.config");

const app = express()
require('dotenv').config()
const port = process.env.PORT || 8080


app.use(express.json())
app.use(cors())

app.post('/register', async(req, res) => {
    try {
        const {username, email, password} = req.body
        const hashedPassword = await bcrypt.hash(password,10)
        const result = await pool.query(
            "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *",
            [username, email, hashedPassword]
        )
        res.status(201).json(result.rows[0])
    } catch(error) {
        console.log(error.message)
        res.status(500).send('server error')
    }
})

app.post('/login', async (req, res) => {
    try {
       const {email, password } = req.body
       const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]) 
       const user = result.rows[0]
       if(!user) {
        return res.status(400).json({message: 'invalid credentials'})
       }
       const isPassword = await bcrypt.compare(password, user.password)
       if(!isPassword) {
        return res.status(400).json({message:"invalid password"})
       }
       const token = jwt.sign({ userId: user.id}, process.env.SECRET, {
        expiresIn: "1h"
       })
       res.json({token})
    } catch (error) {
        console.error(error.message)
        res.status(500).send('server error')
    }
})

const verifyToken = (req, res, next) => {
    const token = req.headers.authorization && req.headers.authorization.split(" ")[1]

    if(!token) {
        return res.status(401).json({message: "missing token"})
    }

    try {
        const decode = jwt.verify(token, 'secret')
        req.user = decode
        next()
    } catch (error) {
        console.error('Token Verification failed', error.message)
        res.status(401).json({ message : "Invalid token"})
    }
}

app.get("/userInfo", verifyToken, (req, res) => {
    res.json({ user: req.user })
})

app.listen(port, () => {
    console.log(`server is runing on ${port}`)
})