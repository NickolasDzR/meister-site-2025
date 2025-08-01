const inputs = document.querySelectorAll(".input:not(.input_select)") as NodeListOf<HTMLDivElement>;


const inputEventHandling = (input: HTMLInputElement) => {
    input.addEventListener("input", event => {
        const target = event.target as HTMLInputElement || HTMLTextAreaElement || HTMLSelectElement;
        const isInputFilled = target.value.length > 0;

        target.classList[`${isInputFilled ? "add" : "remove"}`]("valid");

        // Удаляем disabled с кнопки, если она есть
        if (target.classList.contains("error")) {
            target.classList.remove("error");

            const form = target.closest(".cargo-calc__form") as HTMLFormElement;

            if (form) {
                const button = form.querySelector(".cargo-calc__button") as HTMLButtonElement;

                if (button) {
                    button.disabled = false;
                } else {
                    console.error("Кнопка формы не найдена")
                }
            } else {
                console.error("Не смог найти родителя тег form")
            }
        }
    });
}

if (inputs.length) {
    Array.from(inputs, input => {
        inputEventHandling(input.querySelector("input") as HTMLInputElement);
    })
}