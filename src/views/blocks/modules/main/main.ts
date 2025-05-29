const cargoCalcButton = document.querySelector(".main__cargo-calc-button") as HTMLButtonElement;
const cargoCalc = document.querySelector(".cargo-calc") as HTMLDivElement;

if (cargoCalcButton && cargoCalc) {
    cargoCalcButton.addEventListener("click", () => cargoCalc.classList.add("active"));
}