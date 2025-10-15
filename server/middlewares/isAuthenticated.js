function isAuthenticated(req, res, next) {
    if (req.session?.user) return next()
    else return res.status(401).json({ message: "Non authentifié" })
}

export default isAuthenticated