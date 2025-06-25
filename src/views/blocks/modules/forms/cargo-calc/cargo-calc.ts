const closeFormButton = document.querySelector('.cargo-calc__close-button') as HTMLDivElement;
const cargoCalcMain = document.querySelector('.cargo-calc') as HTMLDivElement;

if (closeFormButton) {
    closeFormButton.addEventListener('click', () => cargoCalcMain.classList.remove("active"));

    // TODO При нажатии на кнопку сделать валидацию инпутов и просчёт рейса
    const cargoCalcFormButton = document.querySelector(".cargo-calc__button") as HTMLButtonElement;

    cargoCalcFormButton.addEventListener('click', e => {

    });
}