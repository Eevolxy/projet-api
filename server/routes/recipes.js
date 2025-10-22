import express from 'express'
import {db} from "../middlewares/db.js";
import isAdmin from "../middlewares/isAdmin.js";
import {v4 as uuidv4} from 'uuid'

const router = express.Router()

/**
 * Renvoie toutes les recettes de la base de données dans un fichier JSON
 * @returns {JSON} Le tableau JSON
 */
router.get("/", (req, res) => {
    db.all("SELECT * FROM recipes", (err, rows) => {
        if (err) return res.status(500).json({ error: err.message })

        const recipes = rows.map(r => ({ ...r, ingredients: JSON.parse(r.ingredients) }))
        res.json(recipes)
    })
})

/**
 * Renvoie le tableau JSON de la recette spécifiée
 * @param {string} id : L'uuid de la recette cible
 * @returns {JSON} Le tableau JSON de la recette
 */
router.get("/:id", (req, res) => {
    db.get("SELECT * FROM recipes WHERE id = ?", [req.params.id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message })
        if (!row) return res.status(404).json({ error: "Recette non trouvée" })

        row.ingredients = JSON.parse(row.ingredients)
        res.json(row)
    })
})

/**
 * Permet à un administrateur de publier une nouvelle recette
 * @param {JSON} req : La requête contenant la nouvelle recette
 */
router.post("/", isAdmin, (req, res) => {
    const { title, persons, duration, ingredients, instructions } = req.body
    const id = uuidv4()

    db.run(
        `INSERT INTO recipes (id, title, persons, duration, ingredients, instructions) VALUES (?,?,?,?,?,?)`,
        [id, title, persons, duration, JSON.stringify(ingredients), instructions],
        function(err) {
            if (err) return res.status(500).json({ error: err.message })
            res.status(201).json({ id, title, persons, duration, ingredients, instructions })
        }
    )
})

/**
 * Permet à un administrateur de modifier la recette spécifiée par l'id
 * @param {string} id : L'uuid de la recette cible
 * @param {JSON} req : Le tableau JSON qui va modifier la recette
 */
router.put("/:id", isAdmin, (req, res) => {
    const { title, persons, duration, ingredients, instructions } = req.body

    db.run(
        `UPDATE recipes
         SET title = ?, persons = ?, duration = ?, ingredients = ?, instructions = ?
         WHERE id = ?`,
        [title, persons, duration, JSON.stringify(ingredients), instructions, req.params.id],
        function (err) {
            if (err) return res.status(500).json({ error: err.message })
            if (this.changes === 0) return res.status(404).json({ error: "Recette non trouvée" })
            res.json({ id: parseInt(req.params.id), title, persons, duration, ingredients, instructions })
        }
    )
})

/**
 * Permet à un administrateur de supprimer la recette specifiée
 * @param {string} id : L'uuid de la recette cible
 */
router.delete("/:id", isAdmin, (req, res) => {
    db.run("DELETE FROM recipes WHERE id = ?", [req.params.id], function (err) {
        if (err) return res.status(500).json({ error: err.message })
        if (this.changes === 0) return res.status(404).json({ error: "Recette non trouvée" })
        res.json({ message: "Recette supprimée" })
    })
})

export default router