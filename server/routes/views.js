import express from "express"
import {db} from "../middlewares/db.js"

const router = express.Router()

router.get('/', (req, res) => {
    db.all("SELECT * FROM recipes", (err, rows) => {
        if (err) return res.status(500).send("Erreur serveur")

        const recipes = rows.map(r => ({
            ...r,
            ingredients: JSON.parse(r.ingredients)
        }))

        res.render('index', { recipes })
    })
})

export default router