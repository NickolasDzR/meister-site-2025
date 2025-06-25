const inputs = document.querySelectorAll(".input:not(.input_select)") as NodeListOf<HTMLDivElement>;


const inputEventHandling = (input: HTMLInputElement) => {
    input.addEventListener("input", event => {
        const target = event.target as HTMLInputElement || HTMLTextAreaElement || HTMLSelectElement;
        const isInputFilled = target.value.length > 0;

        target.classList[`${isInputFilled ? "add" : "remove"}`]("valid");
    });
}

if (inputs.length) {
    Array.from(inputs, input => {
        inputEventHandling(input.querySelector("input") as HTMLInputElement);
    })
}