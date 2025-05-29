const closeFormButton = document.querySelector('.cargo-calc__close-button') as HTMLDivElement;
const cargoCalcMain = document.querySelector('.cargo-calc') as HTMLDivElement;

if (closeFormButton) {
    closeFormButton.addEventListener('click', () => cargoCalcMain.classList.remove("active"))
}