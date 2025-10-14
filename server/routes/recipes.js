import express from 'express'
// import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import sqlite3 from 'sqlite3'

const router = express.Router()
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const db = new sqlite3.Database(path.join(__dirname, "../data/recipes.db"))

// const DATA_PATH = path.join(__dirname, "../data/recipes.json")

/* function readData() {
    return JSON.parse(fs.readFileSync(DATA_PATH, "utf-8"))
}

function writeData(data) {
    fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2))
} */

router.get("/", (req, res) => {
/*    const recipes = readData()
    res.json(recipes) */

    db.all("SELECT * FROM recipes", (err, rows) => {
        if (err) return res.status(500).json({ error: err.message })

        const recipes = rows.map(r => ({ ...r, ingredients: JSON.parse(r.ingredients) }))
        res.json(recipes)
    })
})

router.get("/:id", (req, res) => {
  /*  const recipes = readData()
    const recipe = recipes.find(r => r.id === parseInt(req.params.id))
    recipe ? res.json(recipe) : res.status(404).json({ error: "Recette non trouvée" }) */

    db.get("SELECT * FROM recipes WHERE id = ?", [req.params.id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message })
        if (!row) return res.status(404).json({ error: "Recette non trouvée" })

        row.ingredients = JSON.parse(row.ingredients)
        res.json(row)
    })
})

router.post("/", (req, res) => {
  /*  const recipes = readData()
    const newRecipe = { id: Date.now(), ...req.body }
    recipes.push(newRecipe)
    writeData(recipes)
    res.status(201).json(newRecipe) */

    const { title, persons, duration, ingredients, instructions } = req.body

    db.run(
        `INSERT INTO recipes (title, persons, duration, ingredients, instructions) VALUES (?,?,?,?,?)`,
        [title, persons, duration, JSON.stringify(ingredients), instructions],
        function(err) {
            if (err) return res.status(500).json({ error: err.message })
            res.status(201).json({ id: this.lastID, title, persons, duration, ingredients, instructions })
        }
    )
})

router.put("/:id", (req, res) => {
  /*  const recipes = readData()
    const index = recipes.findIndex(r => r.id === parseInt(req.params.id))
    if (index === -1) return res.status(404).json({ error: "Recette non trouvée" })
    recipes[index] = {...recipes[index], ...req.body }
    writeData(recipes)
    res.json(recipes[index]) */

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

router.delete("/:id", (req, res) => {
 /*   let recipes = readData()
    const initialLen = recipes.length
    recipes = recipes.filter(r => r.id !== parseInt(req.params.id))
    if (recipes.length === initialLen) return res.status(404).json({ error: "Recette non trouvée" })
    writeData(recipes)
    res.json({ message: "Recette supprimée" }) */

    db.run("DELETE FROM recipes WHERE id = ?", [req.params.id], function (err) {
        if (err) return res.status(500).json({ error: err.message })
        if (this.changes === 0) return res.status(404).json({ error: "Recette non trouvée" })
        res.json({ message: "Recette supprimée" })
    })
})

export default router