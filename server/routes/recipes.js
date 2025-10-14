import express from 'express'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const router = express.Router()
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const DATA_PATH = path.join(__dirname, "../data/recipes.json")

function readData() {
    return JSON.parse(fs.readFileSync(DATA_PATH, "utf-8"))
}

function writeData(data) {
    fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2))
}

router.get("/", (req, res) => {
    const recipes = readData()
    res.json(recipes)
})

router.get("/:id", (req, res) => {
    const recipes = readData()
    const recipe = recipes.find(r => r.id === parseInt(req.params.id))
    recipe ? res.json(recipe) : res.status(404).json({ error: "Recette non trouvée" })
})

router.post("/", (req, res) => {
    const recipes = readData()
    const newRecipe = { id: Date.now(), ...req.body }
    recipes.push(newRecipe)
    writeData(recipes)
    res.status(201).json(newRecipe)
})

router.put("/:id", (req, res) => {
    const recipes = readData()
    const index = recipes.findIndex(r => r.id === parseInt(req.params.id))
    if (index === -1) return res.status(404).json({ error: "Recette non trouvée" })
    recipes[index] = {...recipes[index], ...req.body }
    writeData(recipes)
    res.json(recipes[index])
})

router.delete("/:id", (req, res) => {
    let recipes = readData()
    const initialLen = recipes.length
    recipes = recipes.filter(r => r.id !== parseInt(req.params.id))
    if (recipes.length === initialLen) return res.status(404).json({ error: "Recette non trouvée" })
    writeData(recipes)
    res.json({ message: "Recette supprimée" })
})

export default router