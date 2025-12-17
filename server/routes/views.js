import express, {response} from "express"
import {db} from "../middlewares/db.js"
import multer from "multer";

const upload = multer({ dest: 'client/static/img' })
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

router.delete('/delete-recipe/:id', async (req, res) => {
    try {
        const recipeId = req.params.id
        const sessionCookie = req.headers.cookie

        const apiResponse = await fetch(`http://localhost:3000/api/recipes/${recipeId}`, {
            method: 'DELETE',
            headers: {
                'Cookie': sessionCookie
            }
        });

        if (apiResponse.ok) {
            res.status(200).json({ message: "Supprimé" })
        } else {
            res.status(apiResponse.status).json({ message: "Échec suppression API" })
        }
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

router.get('/create-recipe', (req, res) => {
    res.render('createRecipe')
})

router.post('/create-recipe', upload.single("Image"), async (req, res) => {
    try {
        const { Title, NbPersons, Duration, Ingredients, Instructions } = req.body
        const imagePath = req.file ? `../static/img/${req.file.filename}` : null

        const recipeData = {
            title: Title,
            persons: parseInt(NbPersons),
            duration: Duration,
            ingredients: Ingredients.split(',').map(i => i.trim()),
            instructions: Instructions,
            image: imagePath
        }

        const sessionCookie = req.headers.cookie

        const apiResponse = await fetch('http://localhost:3000/api/recipes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': sessionCookie
            },
            body: JSON.stringify(recipeData)
        });

        if (apiResponse.ok) {
            res.redirect('/')
        } else {
            const errorText = await apiResponse.text()
            console.error("L'API a refusé l'insertion :", errorText)
            res.status(500).send(`Erreur API : ${errorText}`)
        }
    } catch (err) {
        console.error("Erreur réseau ou serveur :", err);
        res.status(500).send("Impossible de contacter l'API")
    }
});

export default router