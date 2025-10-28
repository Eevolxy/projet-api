/**
 * Middleware pour vérifier si un utilisateur est déjà connecté et redirige vers l'accueil
 * @param req
 * @param res
 * @param next
 * @return {*}
 */
export default function isAlreadyAthenticated(req, res, next) {
    if (req.session?.user) return res.redirect('/')
    next()
}