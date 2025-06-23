import NiceSelect from "@nice-select2";
import {ClassWatcher} from "@classWatcher";
import dadata from "@dadatajson";
import {DadataJson, niceSelect2Instance} from "@types";

const selects = document.querySelectorAll(".input__placeholder_select") as NodeListOf<HTMLSelectElement>;
const url = "../../json/dadata.json";
const token = "3f637eb956c800c700b18d79bb1fb687cdcb2b94";
const secret = "28deeea55b3c9720d891d81b5c7797b94026d4d3";

var dadataOptions = {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
    },
}

const niceSelectInstance:Array<niceSelect2Instance> | any[] = [];

const onChangedInput = (event: Event) => {
    const input = event.target as HTMLInputElement;
    const value = input.value;

    // TODO должен быть фетч с поиском по результатам в value, который нужно будет сделать настоящий
    // TODO Еще придумать regex, который будет выделять строку из value с результатом, который придёт от dadata

    const results = Array.from(dadata as Array<DadataJson>, address => address.result);

    const parentInputBlock = input.closest(".input") as HTMLDivElement;
    const select = parentInputBlock.querySelector("select") as HTMLSelectElement;
    const selectIndex = select.dataset['index']

    if (dadata.length > 0) {
        const options = select.querySelectorAll("option");

        options.forEach(option => option.remove());

        Array.from(results, (result, i) => {
            const option = document.createElement("option") as HTMLOptionElement;

            option.value = `${i}`;
            option.innerText = result;

            select.insertAdjacentElement("beforeend", option);

            if (niceSelectInstance) {
                niceSelectInstance[`${selectIndex}`].update();
            }
        })
    }
}


const onAddNewTag = (elem: HTMLElement) => {
    const currentSelect = elem as HTMLSelectElement;
    const dropdown = currentSelect.nextElementSibling as HTMLDivElement;
    const input = dropdown.querySelector(".nice-select-search") as HTMLInputElement;

    input.addEventListener("input", onChangedInput)

}

const newSelectSettings = {
    searchable: true,
}

if (selects.length > 0) {
    Array.from(selects, (select, i) => {
        const currentInput = select.closest(".input") as HTMLDivElement;
        const dataSelectPlaceholder = currentInput.querySelector("option[data-select]") as HTMLOptionElement;

        (currentInput.querySelector("select") as HTMLSelectElement).dataset['index'] = `${i}`

        dataSelectPlaceholder ? newSelectSettings['placeholder'] = dataSelectPlaceholder.dataset.select : 'Выберите';

        new ClassWatcher('tag', currentInput, 'open', onAddNewTag.bind(this, select))

        const niceSelectCurrentInstance = new NiceSelect(select as HTMLSelectElement, newSelectSettings) as niceSelect2Instance;


        niceSelectInstance.push(niceSelectCurrentInstance);
    })
}




// @ts-ignore
ymaps.ready(init);

function init() {
    // @ts-ignore
    var multiRoute = new ymaps.multiRouter.MultiRoute({
        referencePoints: [
            [56.250567, 43.478801], // Точка А (например, координаты Красной площади)
            [56.781984, 44.256649]  // Точка Б (например, координаты Парка Горького)
        ],
        params: {
            results: 1 // Запрашиваем только один маршрут
        }
    }, {
        boundsAutoApply: true // Автоматически подстраивать карту под маршрут
    });

    multiRoute.model.events.add('requestsuccess', function () {
        var activeRoute = multiRoute.getActiveRoute();
        if (activeRoute) {
            var distance = activeRoute.properties.get("distance");
            // distance будет в метрах, переводим в километры
            var distanceKm = distance.value / 1000;
            console.log("Расстояние между точками: " + distanceKm + " км");
        }
    });
}