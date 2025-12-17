import express from "express"
import {db} from "../middlewares/db.js"

const router = express.Router()

/**
 * Route pour afficher la page index
 * @route GET /
 * @access public
 * @param {express.Request} req - La requête Express
 * @param {express.Response} res - La réponse Express
 * @return {void} Rend la vue 'index' avec les données des recettes
 * @locals {Object[]} recipes - Liste des recettes envoyées à la vue
 * @locals {string} recipes[].id - Identifiant unique de la recette
 * @locals {string} recipes[].title - Titre de la recette
 * @locals {number} recipes[].persons - Nombre de personnes
 * @locals {string} recipes[].duration - Durée de préparation
 * @locals {Object[]} recipes[].ingredients - Liste des ingrédients
 * @locals {string} recipes[].instructions - Instructions de préparation
 */
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

/**
 * Route pour afficher la page d'une recette
 * @route GET /recipe/:id
 * @access public
 * @param {express.Request} req - La requête Express
 * @param {express.Response} res - La réponse Express
 * @return {void} Rend la vue 'recipe' avec les données d'une recette
 * @locals {Object[]} recipe - Les détails de la recette envoyée à la vue
 * @locals {string} recipe.id - Identifiant unique de la recette
 * @locals {string} recipe.title - Titre de la recette
 * @locals {number} recipe.persons - Nombre de personnes
 * @locals {string} recipe.duration - Durée de préparation
 * @locals {Object[]} recipe.ingredients - Liste des ingrédients
 * @locals {string} recipe.instructions - Instructions de préparation
 */
router.get('/recipe/:id', (req, res) => {
    db.get("SELECT * FROM recipes WHERE id = ?", [req.params.id], (err, row) => {
        if (err) return res.redirect('/')
        if (!row) return res.redirect('/')

        row.ingredients = JSON.parse(row.ingredients)
        res.render('recipe', { recipe: row })
    })
})

router.get('/create-recipe', (req, res) => {
    res.render('createRecipe')
})

export default router