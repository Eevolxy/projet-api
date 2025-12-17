/* ********** Global Variables ********** */
formRecipe = document.getElementById("formRecipe")

/* ********** Functions ********** */


/* ********** Initial Display ********** */

/* ********** Event Listeners ********** */
formRecipe.addEventListener("submit", (event) => {
    event.preventDefault()
    const dataRecipe = new FormData(event.target)
    console.log("Récupération des données avec `dataRecipe.get('Nom de l'input à récupérer')`")
    window.location.href = "/index"
})
