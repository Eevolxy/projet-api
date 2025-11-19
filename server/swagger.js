import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "API YBoost",
            version: "1.0.0",
            description: "Documentation Swagger générée à partir des commentaires JSDoc",
        },
        components: {
            schemas: {
                Recipe: {
                    type: "object",
                    properties: {
                        id: { type: "string", example: "550e8400-e29b-41d4-a716-446655440000" },
                        title: { type: "string", example: "Pâtes carbonara" },
                        persons: { type: "integer", example: 4 },
                        duration: { type: "string", example: "30min" },
                        ingredients: {
                            type: "array",
                            items: { type: "string" },
                            example: ["pâtes", "œufs", "lardons"]
                        },
                        instructions: { type: "string", example: "Cuire les pâtes..." }
                    }
                },
                RecipeInput: {
                    type: "object",
                    required: ["title", "persons", "duration", "ingredients", "instructions"],
                    properties: {
                        title: { type: "string", example: "Nouvelle recette" },
                        persons: { type: "integer", example: 2 },
                        duration: { type: "string", example: "15min" },
                        ingredients: {
                            type: "array",
                            items: { type: "string" },
                            example: ["tomates", "basilic"]
                        },
                        instructions: { type: "string", example: "Faire revenir les tomates..." }
                    }
                }
            }
        }
    },
    apis: ["./server/routes/*.js"], // tes fichiers de routes documentés avec JSDoc
}

export const swaggerSpec = swaggerJsdoc(options);

export default function swaggerDocs(app) {
    app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    console.log("📘 Swagger dispo sur http://localhost:3000/docs");
}
