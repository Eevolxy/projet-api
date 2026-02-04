import express from "express";
import {db} from "../middlewares/db.js";
import isAlreadyAthenticated from "../middlewares/isAlreadyAthenticated.js";
import {v4 as uuidv4} from 'uuid'
import bcrypt from "bcrypt"

const router = express.Router()

/**
 * Vérifie si l'email passée en parmètre est une email valide
 * @param {string} str - L'email à vérifier
 * @return {boolean}
 */
function isEmail(str) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(str);
}

/**
 * Vérifie si le nom et l'adresse mail passée en paramètre sont déjà présents dans la base de données
 * @param {string} username - Le nom de l'utilisateur à vérifier
 * @param {string} email - L'adresse de l'utilisateur à vérifier
 * @return {Promise<{error: boolean, message: string}>}
 */
function checkUser(username, email) {
    return new Promise((resolve, reject) => {
        db.get("SELECT username, email FROM users WHERE username = ? OR email = ?", [username, email], (err, user) => {
            if (err) return reject(err);

            if (user) {
                if (user.username === username) {
                    return resolve({ error: true, message: "Ce nom d'utilisateur est déjà pris" });
                }
                if (user.email === email) {
                    return resolve({ error: true, message: "Cette email est déjà prise" });
                }
            }

            resolve({ error: false });
        });
    });
}

/**
 * Hash le mot de passe passé en paramètre et renvoie la valeur obtenue
 * @param {string} password - Mot de passe à hasher
 * @return {Promise<string>} Le mot de passe hashé ou un message d'erreur
 */
async function hashPassword(password) {
    try {
        const salt = await bcrypt.genSalt(10)
        return await bcrypt.hash(password, salt)
    } catch (error) {
        return "Erreur de hash"
    }
}

/**
 * Connexion d'un utilisateur via l'endpoint API
 * @route POST /api/login
 * @access public
 * @param {express.Request} req - La requête Express
 * @param {express.Response} res - La réponse Express
 * @param {string} req.body.username - Le nom d'utilisateur
 * @param {string} req.body.password - Le mot de passe
 * @return {Object} Le résultat de l'interaction
 */
router.post('/api/login', async (req, res) => {
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

/**
 * Route pour afficher la page de connexion
 * @route GET /login
 * @access public
 * @param {express.Request} req - La requête Express
 * @param {express.Response} res - La réponse Express
 * @return {void} Rend la vue 'login'
 */
router.get('/login', isAlreadyAthenticated, (req, res) => {
    res.render('login')
})

/**
 * Gère la connexion d'un utilisateur via la page 'login'
 * @route POST /login
 * @access public
 * @param {express.Request} req - La requête Express
 * @param {express.Response} res - La réponse Express
 * @param {string} req.body.PseudoOrEmail - Le pseudo ou l'email de l'utilisateur
 * @param {string} req.body.password - Le mot de passe de l'utilisateur
 * @return {void} Rend la vue 'login' avec un message d'erreur en cas d'échec, redirige vers '/' en cas de succès
 */
router.post('/login', async (req, res) => {
    const { PseudoOrEmail, password } = req.body
    const isMail = isEmail(PseudoOrEmail)
    const query = isMail ? "SELECT * FROM users WHERE email = ?" : "SELECT * FROM users WHERE username = ?"

    db.get(query, [PseudoOrEmail], async (err, user) => {
        if (err) return res.render('login', { error: "Erreur serveur" })
        if (!user) return res.render('login', { error: "Utilisateur introuvable" })

        const match = await bcrypt.compare(password, user.password)

        if (!match) return res.render('login', { error: "Mot de passe incorrect" })
        req.session.user = {
            id: user.id,
            username: user.username,
            role: user.isAdmin === 1 ? 'admin' : 'user'
        }
        return res.redirect('/')
    })
})

router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) return res.status(500).send("Erreur déconnexion")
        res.clearCookie('connect.sid')
        res.redirect('/')
    });
})

/**
 * Route pour afficher la page de création de compte
 * @route GET /register
 * @access public
 * @param {express.Request} req - La requête Express
 * @param {express.Response} res - La réponse Express
 * @return {void} Rend la vue 'register'
 */
router.get('/register', isAlreadyAthenticated, (req, res) => {
    res.render('register')
})

/**
 * Gère la création d'un compte via la page 'register'
 * @route POST /register
 * @access public
 * @param {express.Request} req - La requête Express
 * @param {express.Response} res - La réponse Express
 * @param {string} req.body.Pseudo - Pseudo du nouvel utilisateur
 * @param {string} req.body.Email - Email du nouvel utilisateur
 * @param {string} req.body.password - Mot de passe du nouvel utilisateur
 * @return {void} Rend la vue 'register' avec un message d'erreur, redirige vers '/' en cas de succès
 */
router.post('/register', async (req, res) => {
    const { Pseudo, Email, password } = req.body
    if (!isEmail(Email)) return res.render('register', { error: "Mauvais format d'email" })

    const { error, message } = await checkUser(Pseudo, Email)
    if (error) return res.render('register', { error: message })

    const userId = uuidv4()
    const hashedPassword = await hashPassword(password)

    db.run(`INSERT INTO users (id, username, email, password) 
        VALUES (?,?,?,?)`, [userId, Pseudo, Email, hashedPassword], function(err) {
        if (err) return res.render('register', { error: "Erreur serveur lors de la création du compte" })

        req.session.user = {
            id: userId,
            name: Pseudo,
            role: 'user'
        }

        res.redirect('/')
    })
})

export default router