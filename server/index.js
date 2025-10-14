import express from 'express';
import recipesRoutes from './routes/recipes.js'

const app = express();
const PORT = 3000

app.use(express.json());

app.use("/api/recipes", recipesRoutes)


app.listen(PORT, () => {
    console.log("Serveur ouvert sur localhost:3000")
})