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

router.get('/recipe/:id', (req, res) => {
    db.get("SELECT * FROM recipes WHERE id = ?", [req.params.id], (err, row) => {
        if (err) return res.redirect('/')
        if (!row) return res.redirect('/')

        row.ingredients = JSON.parse(row.ingredients)
        res.render('recipe', { recipe: row })
    })
})

export default router