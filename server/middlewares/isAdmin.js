/**
 * Middleware pour vérifier si l'utilisateur connecté est admin ou non
 * @param req
 * @param res
 * @param next
 * @return {*}
 */
export default function isAdmin(req, res, next) {
    if (req.session?.user?.role === 'admin') return next()
    return res.status(403).json({ message: "Accès interdit : admin seulement" })
}