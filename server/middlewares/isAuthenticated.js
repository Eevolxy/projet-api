/**
 * Middleware qui vérifie si un utilisateur est connecté à l'api
 * @param req - La requête Express
 * @param res - La réponse Express
 * @param next
 * @return {*}
 */
function isAuthenticated(req, res, next) {
    if (req.session?.user) return next()
    else return res.status(401).json({ message: "Non authentifié" })
}

export default isAuthenticated