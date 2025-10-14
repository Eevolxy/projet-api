import express from 'express';
import recipesRoutes from './routes/recipes.js'
import path from "path";
import {engine} from "express-handlebars";

const app = express();
const PORT = 3000

app.use(express.json());
app.use(express.urlencoded({ extended: true }))

app.set('views', path.join(__dirname, '..', 'client', 'views'))
app.use('/static', express.static(path.join(__dirname, '..', 'client', 'static')))

app.engine('handlebars', engine())
app.set('view engine', 'handlebars')

app.use("/api/recipes", recipesRoutes)


app.listen(PORT, () => {
    console.log("Serveur ouvert sur localhost:3000")
})