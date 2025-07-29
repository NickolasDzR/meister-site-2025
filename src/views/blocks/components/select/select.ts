import NiceSelect from "@nice-select2";
import {
    addressesResponseType, DeliveryCostConfig,
    formatedAddressesResponseType,
    niceSelect2Instance,
    SelectSettings,
    valueFormElementsTypes, WeightCategory
} from "@types";
import {YMAPLoader} from "@utils";
import {YMapApiKey} from "../../../../ts/main";

declare var ymaps: any;

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

    // TODO Еще придумать regex, который будет выделять строку из value с результатом, который придёт от dadata

    // При каждом вызове нужно делать fetch в dadata с поиском адресов по введёному ключу с debounce
    // Подставляем данные в нужный селект

    const res: addressesResponseType = await getDataAddress(value);

    // Получаем нужные данные
    const results = Array.from(res["suggestions"], address => {
        return {
            "value": address["value"],
            "lon": address["data"]["geo_lon"],
            "lat": address["data"]["geo_lat"]
        } as formatedAddressesResponseType
    });

    // Удаляем пустые (null) значения и дубли
    const uniqueLocations = [...new Map(results
        .filter(({value}) => value != null)
        .map(obj => [obj.value, obj]) // Группируем по городу
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
                    option.innerText = `${location["value"]}`;
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

const onReadResultsDoneHandler = (event) => {
    event.preventDefault();

    const costCalculatedBlock = document.querySelector(".cost-calculated") as HTMLDivElement;

    if (costCalculatedBlock) {
        const cargoCalcDeliveryResultsWrapper = document.querySelector(".cargo-calc__delivery-results-wrapper") as HTMLDivElement;

        if (cargoCalcDeliveryResultsWrapper) {
            costCalculatedBlock.addEventListener("transitionend", () => {
                setTimeout(() => {
                    cargoCalcDeliveryResultsWrapper.innerText = '';
                }, 100)
            }, {once: true});
        }

        costCalculatedBlock.classList.remove("cost-calculated");
    }
}

/**
 *
 * @param distance
 */
const textGenerationHandler = (distance: string): string => {
    if (distance) {
        return `
            <p class="cargo-calc__delivery-results-text">
                Стоимость рейса составит примерно 
                <span class="cargo-calc__delivery-results-text-cost">${distance}</span> 
                рублей.
            </p>
            <p class="cargo-calc__delivery-results-text">
                Для более точного расчёта стоимости рейса позвоните нашему менеджеру по телефону 
                <span style="white-space: nowrap">+7 999 120 59 82</span>, 
                поскольку нужны дополнительные данные о характере груза.
            </p>
        `
    } else {
        return `
            <p class="cargo-calc__delivery-results-text">
                К сожалению, не удалось рассчитать стоимость рейса.
            </p>
            <p class="cargo-calc__delivery-results-text">
                Возможно, выбранный маршрут временно недоступен либо произошла техническая ошибка.
                
                Рекомендуем связаться с нашими специалистами по указанному телефону для уточнения деталей расчета.
                <span style="white-space: nowrap">+7 999 120 59 82</span>
            </p>
        `
    }
}

const showUserResults = (deliveryCosts: string | undefined, form: HTMLFormElement) => {
    const formParent = form.closest(".cargo-calc") as HTMLDivElement;
    const costTextWrapper = formParent.querySelector(".cargo-calc__delivery-results-wrapper") as HTMLSpanElement;

    if (deliveryCosts || typeof deliveryCosts !== 'string') {
        if (costTextWrapper) {
            costTextWrapper.insertAdjacentHTML('afterbegin', textGenerationHandler(deliveryCosts as string))

            formParent.classList.add("cost-calculated");
        }
    } else {

    }
}

const deliveryCosts: Record<WeightCategory, DeliveryCostConfig> = {
    upTo2Tons: {minWeight: 0, maxWeight: 2, costPerKm: 40},
    from2to5Tons: {minWeight: 2, maxWeight: 5, costPerKm: 52},
    from5to10Tons: {minWeight: 5, maxWeight: 10, costPerKm: 85},
    from10to20Tons: {minWeight: 10, maxWeight: 20, costPerKm: 120}
};

const formEventHandler = (event) => {
    let text = undefined as string | undefined;
    const form = event.target as HTMLFormElement;

    if (event.detail.data) {
        const distance = +(event.detail.data as string) as number;
        const cargoWeightInput = form.querySelector(".cargo-calc__placeholder[name='weight']") as HTMLInputElement;

        if (cargoWeightInput) {
            const cargoWeight = +cargoWeightInput.value as number;
            let category: WeightCategory;

            // Определяем категорию груза по весу
            if (cargoWeight >= deliveryCosts.upTo2Tons.minWeight && cargoWeight <= deliveryCosts.upTo2Tons.maxWeight) {
                category = 'upTo2Tons';
            } else if (cargoWeight >= deliveryCosts.from2to5Tons.minWeight && cargoWeight <= deliveryCosts.from2to5Tons.maxWeight) {
                category = 'from2to5Tons';
            } else if (cargoWeight >= deliveryCosts.from5to10Tons.minWeight && cargoWeight <= deliveryCosts.from5to10Tons.maxWeight) {
                category = 'from5to10Tons';
            } else if (cargoWeight >= deliveryCosts.from10to20Tons.minWeight && cargoWeight <= deliveryCosts.from10to20Tons.maxWeight) {
                category = 'from10to20Tons';
            } else {
                console.error(`Вес ${cargoWeight} тонн вне допустимого диапазона.`);
                return false;
            }

            // Берём цену за км согласно категории груза
            const costPerKm = deliveryCosts[category].costPerKm as number;

            // Передаём данные в обработчик результатов и показываем пользователю
            text = String(Math.round(costPerKm * distance));
        }
    // Если у нас ошибка в возвращаемом значении дистации между точками
    } else {
        text = undefined;
    }

    showUserResults(text, form);
};

let multiRoute: any;

const costCalculator = (coord: [number, number], form: HTMLFormElement) => {
    if (multiRoute) {
        // @ts-ignore
        multiRoute.model.setReferencePoints(coord, [], []);   // Устанавливаем новые координаты
    } else {
        multiRoute = new ymaps.multiRouter.MultiRoute({
            referencePoints: coord
        }, {});

        multiRoute.model.events.add('requestsuccess', function () {
            const activeRoute = multiRoute.getActiveRoute();

            const distance = activeRoute ? activeRoute.properties.get("distance", {}) : activeRoute;
            // distance будет в метрах, переводим в километры
            // const distanceKm = distance["value"] / 1000;

            // console.log("Расстояние между точками: " + distanceKm + " км", typeof distanceKm);

            const customEvent = new CustomEvent('formCalculationEvent', {
                detail: {
                    data: distance ? distance["value"] / 1000 : distance,
                    timestamp: Date.now()
                },
                cancelable: true,
                bubbles: true,
            });

            form.dispatchEvent(customEvent);
        });

        form.addEventListener("formCalculationEvent", formEventHandler);

        const cargoCalcButtonResults = document.querySelector(".cargo-calc__button-results") as HTMLButtonElement;

        if (cargoCalcButtonResults) {
            cargoCalcButtonResults.addEventListener("click", onReadResultsDoneHandler)
        }
    }
}

const getFormValues = (form: HTMLFormElement): valueFormElementsTypes | undefined | {} => {

    if (form && form.tagName === "FORM") {
        // Оставляем только нужное. Лишнее в виде элементов библии Nice-select2 убираем
        let formElements =
            [...form.elements]
                .filter(element =>
                    element.classList.contains("input__placeholder")
                );

        if (formElements.length > 0) {
            const valueFormElements: valueFormElementsTypes | {} = {}

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

                        const parentSelect = dropdown.closest(".cargo-calc__input") as HTMLDivElement;

                        if (parentSelect) {
                            if (Object.keys(parentSelect.dataset).length > 0 && parentSelect.dataset.lon && parentSelect.dataset.lat) {
                                const lat = parentSelect.dataset.lat as string;
                                const lon = parentSelect.dataset.lon as string;

                                if ("name" in formElement && formElement["name"]) {
                                    valueFormElements[`${formElement["name"]}`] = [Number(lat), Number(lon)] as [number, number];
                                }
                            } else {
                                console.error("data-lan, data-lat - отсутвует один или оба этих значения");
                            }
                        } else {
                            console.error("Элемент с классом .cargo-calc__input не найден")
                        }
                    } else {
                        console.error("dropdown не найден");
                    }
                }
            });

            return valueFormElements

        } else {
            console.error("Элементы не найдены")
        }
    } else {
        console.error("Форма не найдена")
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
    },
    onClickedItem: (item) => {
        if (item) {
            // Проверяем есть ли у него dataset и есть ли dataset со значением - value;
            if (Object.keys(item.dataset).length > 0 && item.dataset.value) {
                const itemIndex = parseInt(item.dataset.value);
                const parentSelect = item.closest(".cargo-calc__input") as HTMLDivElement;

                if (parentSelect) {
                    const currentOption = parentSelect.querySelector(`option[value='${itemIndex}']`) as HTMLOptionElement

                    if (currentOption) {
                        if (Object.keys(currentOption.dataset).length > 0 && currentOption.dataset.lon && currentOption.dataset.lat) {
                            const lat = currentOption.dataset.lat as string;
                            const lon = currentOption.dataset.lon as string;

                            parentSelect.dataset.lat = lat;
                            parentSelect.dataset.lon = lon;
                        } else {
                            console.error("data-lan, data-lat - отсутвует один или оба этих значения");
                        }
                    } else {
                        console.error("Запрашеваемый option не найден")
                    }
                } else {
                    console.error("родитель с классом .cargo-calc__input не найден")
                }
            } else {
                console.error("Отсутствует dataset со значением value");
            }
        } else {
            console.error("Выбранный элемент не найден")
        }

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

const getCargoFormInputValuesHandler = async (button: HTMLButtonElement) => {
    if (button && button.tagName === "BUTTON") {
        const form = button.closest(".cargo-calc__form") as HTMLFormElement;

        // Собираем данные с формы
        const valueFormElements = getFormValues(form);

        // Проверил, есть ли все данные введенные в форме
        if (valueFormElements && valueFormElements["location_0"] && valueFormElements["location_1"] && valueFormElements["weight"]) {
            // После загружаем яндекс карты

            // Отправляем данные в калькулятор цены ПОСЛЕ ТОГО КАК ЯНДЕКС КАРТЫ ЗАГРУЗИЛИСЬ
            // Этот метод сам с этим всем справляется и продолжает дальнешие действия
            ymaps.ready(() => {
                costCalculator([valueFormElements["location_0"], valueFormElements["location_1"]], form);
            })
        } else {
            console.error("Отсутствует одно из значений для просчёта стоимости рейса")
        }

        // ymaps.ready(() => {
        //     if (multiRoute) {
        //         multiRoute.setReferencePoints([valueFormElements["location_0"], valueFormElements["location_1"]]);
        //     } else {
        //         costCalculator([valueFormElements["location_0"], valueFormElements["location_1"]])
        //     }
        // });


            // await YMAPLoader(YMapApiKey)
        //
        //     // const setYMAPDownloadInterval = undefined as undefined | ReturnType<typeof setTimeout>;
        //
        //     ymaps.ready(() => {
        //         if (multiRoute) {
        //             multiRoute.setReferencePoints([valueFormElements["location_0"], valueFormElements["location_1"]]);
        //         } else {
        //             costCalculator([valueFormElements["location_0"], valueFormElements["location_1"]])
        //         }
        //     });

    } else {
        console.error("Кнопка не найдена")
    }
}

cargoCalcButton.addEventListener("click", async (event) => {
    event.preventDefault();

    await YMAPLoader(YMapApiKey);

    // TODO тут сделать прелоадер в качестве логотипа, у которого дорога едет, пока грузится карта. На всяк
    // const onPreloadMap = () => {
    //     turn on preload
    // }

    getCargoFormInputValuesHandler(event.target as HTMLButtonElement);
})
