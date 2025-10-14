import express from 'express'
import fs from 'fs'

const router = express.Router()
const DATA_PATH = "../data/recipes.json"

function readData() {
    return JSON.parse(fs.readFileSync(DATA_PATH, "utf-8"))
}

router.get("/", (req, res) => {
    const recipes = readData()
    res.json(recipes)
})

export default router