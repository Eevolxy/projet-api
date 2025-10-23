import express from "express";
import {db} from "../middlewares/db.js";
import isAlreadyAthenticated from "../middlewares/isAlreadyAthenticated.js";
import {v4 as uuidv4} from 'uuid'
import bcrypt from "bcrypt"

const router = express.Router()

function isEmail(str) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(str);
}

function checkUser(username, email) {
    return new Promise((resolve, reject) =>{
        db.get("SELECT * FROM users WHERE username = ?", [username], (err, user) => {
            if (err) return reject({ error: true, message: "Erreur serveur" })
            if (user) return resolve({ error: true, message: "Ce nom d'utilisateur est déjà pris" })
        })
        db.get("SELECT * FROM users WHERE email = ?", [email], (err, user) => {
            if (err) return reject({ error: true, message: "Erreur serveur" })
            if (user) return resolve({ error: true, message: "Cette email est déjà prise" })
        })
        return { error: false, message: "" }
    })

}

async function hashPassword(password) {
    try {
        const salt = await bcrypt.genSalt(10)
        return await bcrypt.hash(password, salt)
    } catch (error) {
        return "Erreur de hash"
    }
}

router.post('/api/login', async (req, res) => {
    const { username, password } = req.body

    db.get(`SELECT * FROM users WHERE username = ?`, [username], async (err, user) => {
        if (err) return res.status(500).json({ error: err.message })
        if (!user) return res.status(401).json({ message: "Utilisateur introuvable" })

        const match = await bcrypt.compare(password, user.password)

        if (!match) return res.status(401).json({ message: "Mot de passe incorrect" })
        req.session.user = {
            id: user.id,
            username: user.username,
            role: user.isAdmin === 1 ? 'admin' : 'user'
        }
        res.json({ message: "Connexion réussie", user: req.session.user })
    })
})

router.get('/login', isAlreadyAthenticated, (req, res) => {
    res.render('login')
})

router.post('/login', async (req, res) => {
    const { PseudoOrEmail, password } = req.body
    const isMail = isEmail(PseudoOrEmail)
    const query = isMail ? "SELECT * FROM users WHERE email = ?" : "SELECT * FROM users WHERE username = ?"

    db.get(query, [PseudoOrEmail], async (err, user) => {
        if (err) return res.render('login', { error: "Erreur serveur" })
        if (!user) return res.render('login', { error: "Utilisateur introuvable" })

        const match = await bcrypt.compare(password, user.password)

        if (!match) return res.render('login', { error: "Mot de passe incorrect" })
        req.session.user = {
            id: user.id,
            username: user.username,
            role: user.isAdmin === 1 ? 'admin' : 'user'
        }
        res.redirect('/')
    })
})

router.get('/register', isAlreadyAthenticated, (req, res) => {
    res.render('register')
})

router.post('/register', async (req, res) => {
    const { Pseudo, Email, password } = req.body
    if (!isEmail(Email)) return res.render('register', { error: "Mauvais format d'email" })

    const { error, message } = await checkUser(Pseudo, Email)
    if (error) return res.render('register', { error: message })

    const userId = uuidv4()
    const hashedPassword = await hashPassword(password)

    db.run(`INSERT INTO users (id, username, email, password) 
        VALUES (?,?,?,?)`, [userId, Pseudo, Email, hashedPassword], function(err) {
        if (err) return res.render('register', { error: "Erreur serveur lors de la création du compte" })

        req.session.user = {
            id: userId,
            name: Pseudo,
            role: 'user'
        }

        res.redirect('/')
    })
})

export default router