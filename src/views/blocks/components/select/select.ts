import NiceSelect from "@nice-select2";
import {addressesResponseType, formatedAddressesResponseType, niceSelect2Instance, SelectSettings} from "@types";
import {YMAPLoader} from "@utils";
import {YMapApiKey} from "../../../../ts/main";

const dadataUrl: string = "https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/address";
const token: string = "3f637eb956c800c700b18d79bb1fb687cdcb2b94";
const secret: string = "28deeea55b3c9720d891d81b5c7797b94026d4d3";

/**
 * Выполняет HTTP-запрос к серверу Dadata.ru для получения адресных предложений по указанному запросу.
 *
 * @summary Запрашивает адресные предложения через API сервиса Dadata.ru.
 * @description Возвращает промис объектов с результатами запросов по адресу.
 * Использует аутентификационные токены ("token" и "secret") Которые можно получить в л/к dadata.ru.
 *
 * @param {string} query Строка запроса для поиска адреса.
 * @return {Promise<addressesResponseType>} Промис объектов с результатами поиска адресов.
 */
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

/**
 * Обработчик события изменения значения поля ввода.
 * Выполняет асинхронный запрос для получения адресных предложений и обновляет содержимое выпадающего списка.
 *
 * @param {HTMLInputElement} input Поле ввода, чьё изменение инициировало событие.
 */
const onChangedInput = async (input: HTMLInputElement) => {
    const value = input.value;

    // TODO должен быть фетч с поиском по результатам в value, который нужно будет сделать настоящий
    // TODO Еще придумать regex, который будет выделять строку из value с результатом, который придёт от dadata

    // При каждом вызове нужно делать fetch в dadata с поиском адресов по введёному ключу с debounce
    // Подставляем данные в нужный селект

    const res: addressesResponseType = await getDataAddress(value);

    // Получаем нужные данные
    const results = Array.from(res["suggestions"], address => {
        return {
            "city": address["data"]["city_with_type"],
            "lon": address["data"]["geo_lon"],
            "lat": address["data"]["geo_lat"]
        } as formatedAddressesResponseType
    })

    // Удаляем пустые (null) значения и дубли
    const uniqueLocations = [...new Map(results
        .filter(({ city }) => city != null)
        .map(obj => [obj.city, obj]) // Группируем по городу
    ).values()];

    const parentInputBlock = input.closest(".input") as HTMLDivElement;

    if (parentInputBlock) {
        const select = parentInputBlock.querySelector("select") as HTMLSelectElement | null;

        if (select) {
            const selectIndex = select.dataset['index']

            if (results.length > 0) {
                const options = select.querySelectorAll("option") as NodeListOf<HTMLOptionElement>;

                options.forEach(option => option.remove());

                // ...New Set(results) нужен для удаления дублей из массива
                Array.from(uniqueLocations, (location: formatedAddressesResponseType, i: number) => {
                    const option = document.createElement("option") as HTMLOptionElement;

                    option.value = `${i}`;
                    option.innerText = location["city"];
                    option.dataset.lat = `${location["lat"]}`;
                    option.dataset.lon = `${location["lon"]}`;

                    select.insertAdjacentElement("beforeend", option);
                });

                oldInputValue = value;

                if (niceSelectInstance) {
                    niceSelectInstance[`${selectIndex}`].update();
                }
            }
        } else {
            console.error("Элемент select не найден");
        }
    }
}


let debounceInputChange = undefined as undefined | ReturnType<typeof setTimeout>;

const newSelectSettings: SelectSettings = {
    searchable: true,
    placeholder: 'Напишите город',
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

        dataSelectPlaceholder ? newSelectSettings['placeholder'] = <string>dataSelectPlaceholder.dataset.select : 'Выберите';

        const niceSelectCurrentInstance = new NiceSelect(select as HTMLSelectElement, newSelectSettings) as niceSelect2Instance;

        niceSelectInstance.push(niceSelectCurrentInstance);
    })
}

const cargoCalcButton = document.querySelector(".cargo-calc__button") as HTMLButtonElement;

const getCargoFormInputValuesHandler = (button: HTMLButtonElement) => {
    if (button && button.tagName === "BUTTON") {
        const form = button.closest(".cargo-calc__form") as HTMLFormElement;

        if (form && form.tagName === "FORM") {
            // Оставляем только нужное. Лишнее в виде библи Nice-select2 убираем
            let formElements =
                [...form.elements]
                    .filter(element =>
                        element.classList.contains("input__placeholder")
                    );

            if (formElements.length > 0) {
                const valueFormElements = {}

                // TODO получение данных с формы и преобразование их в object нужно вынести в отдельный метод
                Array.from(formElements, (formElement: Element) => {
                    if (formElement.tagName === "INPUT") {
                        if (("name" in formElement) && ("value" in formElement)) {
                            if (formElement["name"] && formElement["value"]) {
                                valueFormElements[`${formElement["name"]}`] = formElement.value;
                            } else {
                                console.error(formElement["name"] ? "Отсутствует значение в инпуте, заполните инпут" : "У инпута должно быть name")
                            }
                        }
                    } else if (formElement.tagName === "SELECT") {
                        const dropdown = formElement.nextElementSibling as HTMLDivElement;

                        if (dropdown) {
                            const currentCityQuery = dropdown.querySelector(".current") as HTMLSpanElement;

                            if (currentCityQuery) {
                                const currentCity = currentCityQuery.innerText;

                                // TODO переделать потом, чтобы сравнение было не по этой строке, а надёжнее сделать
                                if (currentCity !== "Выберете место выгрузки") {
                                    if ("name" in formElement && formElement["name"]) {
                                        valueFormElements[`${formElement["name"]}`] = currentCity;
                                    } else {
                                        console.error("Отсутствует имя")
                                    }
                                }
                            } else {
                                console.error("span с классом .current и со значением у select не найден")
                            }
                        } else {
                            console.error("dropdown не найден");
                        }
                    }
                });

                // TODO просчитываем киллометраж и выдаём данные
                // cargoCalcHandler(valueFormElements)
                console.log(valueFormElements);

            } else {
                console.error("Элементы не найдены")
            }
        } else {
            console.error("Форма не найдена")
        }
    } else {
        console.error("Кнопка не найдена")
    }
}

cargoCalcButton.addEventListener("click", async (event) => {
    event.preventDefault();

    // let YMAPLoaderRes: Promise<any> = await YMAPLoader(YMapApiKey);

    // TODO тут сделать прелоадер в качестве логотипа, у которого дорога едет, пока грузится карта. На всяк
    // const onPreloadMap = () => {
    //     turn on preload
    // }

    getCargoFormInputValuesHandler(event.target as HTMLButtonElement);
})


// @ts-ignore
// ymaps.ready(init);
//
// function init() {
//     // @ts-ignore
//     var multiRoute = new ymaps.multiRouter.MultiRoute({
//         referencePoints: [
//             [56.250567, 43.478801], // Точка А (например, координаты Красной площади)
//             [56.781984, 44.256649]  // Точка Б (например, координаты Парка Горького)
//         ],
//         params: {
//             results: 1 // Запрашиваем только один маршрут
//         }
//     }, {
//         boundsAutoApply: true // Автоматически подстраивать карту под маршрут
//     });
//
//     multiRoute.model.events.add('requestsuccess', function () {
//         var activeRoute = multiRoute.getActiveRoute();
//         if (activeRoute) {
//             var distance = activeRoute.properties.get("distance");
//             // distance будет в метрах, переводим в километры
//             var distanceKm = distance.value / 1000;
//             console.log("Расстояние между точками: " + distanceKm + " км");
//         }
//     });
// }