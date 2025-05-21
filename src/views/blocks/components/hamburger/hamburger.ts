const hamburger = document.querySelector('.hamburger') as HTMLButtonElement;
const mobNav = document.querySelector(".js-hamburger-activator") as HTMLDivElement;

console.log(hamburger, mobNav);

if (hamburger && mobNav) {

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('is-active');
        mobNav.classList.toggle("active");
    })
}
