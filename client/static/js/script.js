/* ********** Global Variables ********** */
import { recipes } from "./recipes.js";
const divSearchBar = document.getElementById('search-bar')
const divInput = document.getElementById('search-input')
const divItems = document.getElementById('items')
const titlePage = document.querySelector('h1')
const returnArrow = document.getElementById('return-arrow')
const divRecipeDetail = document.getElementById('recipe-detail')
let displayName = []
let displayImg = []

// Extraction des données des recettes
const listName = divItems.querySelectorAll('*')
const listImg = recipes.map(recipe => recipe.img)


/* ********** Functions ********** */
// Fonction d'affichage des cartes choisies
function displayCards(listNameToDisplay, listImgtoDisplay) {
    for (let i = 0; i < listNameToDisplay.length; i++) {
        const newDiv = document.createElement('div');
        newDiv.className = 'recipe-card';
        const img = document.createElement('img');
        img.src = listImgtoDisplay[i];
        img.alt = listNameToDisplay[i];
        const title = document.createElement('h3');
        title.textContent = listNameToDisplay[i];
        newDiv.appendChild(img);
        newDiv.appendChild(title);
        divItems.appendChild(newDiv);
    }
}

// Fonction d'affichage des détails d'une recette
function displayRecipeDetail(recipe) {
    divRecipeDetail.innerHTML = `
        <img src=${recipe.img} alt="image recipe">
        <div id="recipe-info">
            <h1>${recipe.name}</h1>
            <p>Pour ${recipe.persons} personnes</p>

            <h2>Ingrédients :</h2>
            <ul>
                ${recipe.ingredients.map(ingredient => `<li>${ingredient}</li>`).join('')}
            </ul>

            <h2>Instructions :</h2>
            <ol>
                ${recipe.instructions.map(step => `<li>${step}</li>`).join('')}
            </ol>
        </div>
    `;
}


/* ********** Initial Display ********** */
// displayCards(listName, listImg);

/* ********** Event Listeners ********** */
// Écouteur d'événement sur l'input de recherche
divInput.addEventListener('input', () => {
    let contextInput = divInput.value.toLowerCase()
    const recipeCards = divItems.querySelectorAll('.recipe-card')
    recipeCards.forEach(card => {
        const title = card.querySelector('h3').textContent.toLowerCase()
        if (contextInput === '' ||  title.includes(contextInput)) card.style.display = 'block'
        else card.style.display = 'none'
    });
})

divItems.addEventListener('click', (card) => {
    const target = card.target.closest('.recipe-card');
    if (target) {
        returnArrow.classList.remove('hidden')
        divRecipeDetail.classList.remove('hidden')
        divSearchBar.style.display = 'none'
        titlePage.classList.add('hidden')
        divItems.classList.add('hidden')


        const selectedRecipeName = target.querySelector('h3').textContent
        const selectedRecipe = recipes.find(recipe => recipe.name === selectedRecipeName)
        displayRecipeDetail(selectedRecipe)

    }
});

returnArrow.addEventListener('click', () => {
    returnArrow.classList.add('hidden')
    divRecipeDetail.classList.add('hidden')
    divSearchBar.style.display = 'flex'
    titlePage.classList.remove('hidden')
    divItems.classList.remove('hidden')
    divInput.value = ''
    displayCards(listName, listImg);
});