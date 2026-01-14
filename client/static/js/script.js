const divInput = document.getElementById('search-input')
const divItems = document.getElementById('items')
const noResultsMessage = document.getElementById('no-results')

divInput.addEventListener('input', () => {
    let contextInput = divInput.value.toLowerCase()
    const recipeCards = divItems.querySelectorAll('.recipe-card')

    let hasVisibleRecipe = false;

    recipeCards.forEach(card => {
        const title = card.querySelector('h3').textContent.toLowerCase()

        if (contextInput === '' || title.includes(contextInput)) {
            card.style.display = 'block'
            hasVisibleRecipe = true;
        } else {
            card.style.display = 'none'
        }
    });

    // Affichage ou masquage du message "Aucun résultat"
    if (hasVisibleRecipe) {
        noResultsMessage.style.display = 'none'
    } else {
        noResultsMessage.style.display = 'block'
    }
})