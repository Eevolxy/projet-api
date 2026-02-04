import express from 'express'
import {db} from "../middlewares/db.js";
import isAdmin from "../middlewares/isAdmin.js";
import {v4 as uuidv4} from 'uuid'
import fs from 'fs'
import path from 'path'

import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const router = express.Router()

/**
 * @swagger
 * /api/recipes:
 *   get:
 *     summary: Récupère toutes les recettes
 *     tags: [Recettes]
 *     responses:
 *       200:
 *         description: Liste de toutes les recettes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Recipe'
 */
router.get("/", (req, res) => {
    db.all("SELECT * FROM recipes", (err, rows) => {
        if (err) return res.status(500).json({ error: err.message })

        const recipes = rows.map(r => ({ ...r, ingredients: JSON.parse(r.ingredients) }))
        res.json(recipes)
    })
})

/**
 * @swagger
 * /api/recipes/{id}:
 *   get:
 *     summary: Récupère une recette par son ID
 *     tags: [Recettes]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: L’UUID de la recette
 *     responses:
 *       200:
 *         description: Recette trouvée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Recipe'
 *       404:
 *         description: Recette non trouvée
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
 * @swagger
 * /api/recipes:
 *   post:
 *     summary: Crée une nouvelle recette (admin)
 *     tags: [Recettes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RecipeInput'
 *     responses:
 *       201:
 *         description: Recette créée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Recipe'
 */
router.post("/", isAdmin, (req, res) => {
    const { title, persons, duration, ingredients, instructions, image } = req.body

    const id = uuidv4()

    db.run(
        `INSERT INTO recipes (id, title, persons, duration, ingredients, instructions, image) VALUES (?,?,?,?,?,?, ?)`,
        [id, title, persons, duration, JSON.stringify(ingredients), instructions, image],
        function(err) {
            if (err) return res.status(500).json({ error: err.message })
            res.status(201).json({ id, title, persons, duration, ingredients, instructions })
        }
    )
})

/**
 * @swagger
 * /api/recipes/{id}:
 *   put:
 *     summary: Met à jour une recette (admin)
 *     tags: [Recettes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: UUID de la recette
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RecipeInput'
 *     responses:
 *       200:
 *         description: Recette mise à jour
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Recipe'
 *       404:
 *         description: Recette non trouvée
 */
router.put("/:id", isAdmin, (req, res) => {
    const { title, persons, duration, ingredients, instructions, image } = req.body

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
 * @swagger
 * /api/recipes/{id}:
 *   delete:
 *     summary: Supprime une recette (admin)
 *     tags: [Recettes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: UUID de la recette à supprimer
 *     responses:
 *       200:
 *         description: Recette supprimée
 *       404:
 *         description: Recette non trouvée
 */
router.delete("/:id", isAdmin, (req, res) => {
    db.get("SELECT image FROM recipes WHERE id = ?", [req.params.id], (err, row) => {
        if (err) {
            console.error("Error fetching recipe image:", err.message)
            return res.status(500).json({ error: err.message })
        }
        if (!row) {
            return res.status(404).json({ error: "Recette non trouvée" })
        }

        const imagePathInDB = row.image
        if (imagePathInDB) {
            const filename = path.basename(imagePathInDB)
            const absoluteImagePath = path.join(__dirname, '..', '..', 'client', 'static', 'img', filename)

            fs.unlink(absoluteImagePath, (unlinkErr) => {
                if (unlinkErr) {
                    console.error(`Failed to delete image file ${absoluteImagePath}:`, unlinkErr.message)
                }
                deleteRecipeFromDB(req, res)
            })
        } else {
            deleteRecipeFromDB(req, res)
        }
    })

    function deleteRecipeFromDB(req, res) {
        db.run("DELETE FROM recipes WHERE id = ?", [req.params.id], function (err) {
            if (err) {
                console.error("Error deleting recipe from DB:", err.message)
                return res.status(500).json({ error: err.message })
            }
            if (this.changes === 0) {
                return res.status(404).json({ error: "Recette non trouvée" })
            }
            res.json({ message: "Recette supprimée" })
        })
    }
})

export default router