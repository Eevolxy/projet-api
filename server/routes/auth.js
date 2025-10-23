import express from "express";
import {db} from "../middlewares/db.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import bcrypt from "bcrypt"

const router = express.Router()

function isEmail(str) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(str);
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

router.get('/login', (req, res) => {
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

export default router