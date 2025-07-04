import NiceSelect from "@nice-select2";
import {addressesResponseType, niceSelect2Instance} from "@types";

const dadataUrl: string = "https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/address";
const token: string = "3f637eb956c800c700b18d79bb1fb687cdcb2b94";
const secret: string = "28deeea55b3c9720d891d81b5c7797b94026d4d3";

const getDataAddress: (query: string) => Promise<addressesResponseType> = async (query: string) => {
    return await fetch(dadataUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Token " + token,
            "X-Secret": secret
        },
        body: JSON.stringify({query: query, count: 20})
    })
        .then(r => r)
        .then(r => r.text())
        .then(r => JSON.parse(r))
        .catch(error => error)
}

const selects = document.querySelectorAll(".input__placeholder_select") as NodeListOf<HTMLSelectElement>;

const niceSelectInstance: Array<niceSelect2Instance> | any[] = [];

let oldInputValue: string = "";

const onChangedInput = async (input: HTMLInputElement) => {
    const value = input.value;

    // TODO должен быть фетч с поиском по результатам в value, который нужно будет сделать настоящий
    // TODO Еще придумать regex, который будет выделять строку из value с результатом, который придёт от dadata

    // При каждом вызове нужно делать fetch в dadata с поиском адресов по введёному ключу с debounce
    // Подставляем данные в нужный селект

    const res = await getDataAddress(value);

    const results = Array.from(res["suggestions"], address => address["data"]["city_with_type"]);

    const parentInputBlock = input.closest(".input") as HTMLDivElement;

    if (parentInputBlock) {
        const select = parentInputBlock.querySelector("select") as HTMLSelectElement;
        const selectIndex = select.dataset['index']

        if (results.length > 0) {
            const options = select.querySelectorAll("option");

            options.forEach(option => option.remove());

            Array.from([...new Set(results)], (result, i) => {
                const option = document.createElement("option") as HTMLOptionElement;

                option.value = `${i}`;
                option.innerText = result;

                select.insertAdjacentElement("beforeend", option);
            });

            oldInputValue = value;

            if (niceSelectInstance) {
                niceSelectInstance[`${selectIndex}`].update();
            }
        }
    } else {
        console.error("Селектор parentInputBlock не найден")
    }
}


let debounceInputChange = undefined as undefined | ReturnType<typeof setTimeout>;

const newSelectSettings = {
    searchable: true,
    onSearchInputChanged: (input) => {
        if (debounceInputChange) clearTimeout(debounceInputChange);

        debounceInputChange = setTimeout(onChangedInput, 300, input);
    },
    afterUpdated: (dropdown) => {
        const currentInput = dropdown.querySelector(".nice-select-search") as HTMLSelectElement;

        currentInput.value = oldInputValue;

        oldInputValue = "";
    }
}

if (selects.length > 0) {
    Array.from(selects, (select, i) => {
        const currentInput = select.closest(".input") as HTMLDivElement;
        const dataSelectPlaceholder = currentInput.querySelector("option[data-select]") as HTMLOptionElement;

        (currentInput.querySelector("select") as HTMLSelectElement).dataset['index'] = `${i}`

        dataSelectPlaceholder ? newSelectSettings['placeholder'] = dataSelectPlaceholder.dataset.select : 'Выберите';

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