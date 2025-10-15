import express from "express";
import {db} from "../middlewares/db.js";
import bcrypt from "bcrypt"

const router = express.Router()

router.post('/login', async (req, res) => {
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

export default router