import express from 'express';
import session from 'express-session'
import recipesRoutes from './routes/recipes.js'
import authRoute from './routes/auth.js'
import viewsRoutes from './routes/views.js'
import path from "path";
import {engine} from "express-handlebars";
import {fileURLToPath} from "url";

const app = express();
const PORT = 3000

app.use(express.json());
app.use(express.urlencoded({ extended: true }))
app.use(session({
    secret: "SecretPlaceHolder",
    resave: false,
    saveUninitialized: false
}))

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

app.set('views', path.join(__dirname, '..', 'client', 'views'))
app.use('/static', express.static(path.join(__dirname, '..', 'client', 'static')))

app.engine('handlebars', engine())
app.set('view engine', 'handlebars')
app.engine('handlebars', engine({
    defaultLayout: false
}))

app.use("/api/recipes", recipesRoutes)
app.use(authRoute)
app.use(viewsRoutes)

app.listen(PORT, () => {
    console.log("Serveur ouvert sur localhost:3000")
})