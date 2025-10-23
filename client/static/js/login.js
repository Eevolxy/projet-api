/* ********** Global Variables ********** */
const eye = document.getElementById('eye');
const passwordInput = document.getElementById('password');
const noAccount = document.getElementById('no-account');
const alreadyAccount = document.getElementById('already-account');

/* ********** Functions ********** */
// Change la visibilité du mot de passe
function changeVisibilityPassword() {
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text'
    } else {
        passwordInput.type = 'password';
    }
}

/* ********** Initial Display ********** */

/* ********** Event Listeners ********** */
eye.addEventListener('click', () => {
    changeVisibilityPassword();
    console.log("work");
});

noAccount.addEventListener('click', () => {
    window.location.href = '/register';
});

alreadyAccount.addEventListener('click', () => {
    window.location.href = '/login';
});