import NiceSelect from "@nice-select2";
import {
    addressesResponseType, DeliveryCostConfig,
    formatedAddressesResponseType,
    niceSelect2Instance,
    SelectSettings,
    valueFormElementsTypes, WeightCategory
} from "@types";
import {buttonActiveHandler, inputErrorHandler, preloader, YMAPLoader} from "@utils";
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
    const uniqueLocations = [...new Map(
        results.filter(({ value, lon, lat }) => value && lon && lat)
        .map(obj => [obj.value, obj])
    ).values()];

    // Если у results.length > 0, то Задаем ей значение, что местоположение не найдено
    if (!uniqueLocations.length) {
        uniqueLocations.push({value: `Местоположение не найдено`});
    }

    const parentInputBlock = input.closest(".input") as HTMLDivElement;

    if (parentInputBlock) {
        const select = parentInputBlock.querySelector("select") as HTMLSelectElement | null;

        if (select) {
            const selectIndex = select.dataset['index']

            const options = select.querySelectorAll("option") as NodeListOf<HTMLOptionElement>;

            options.forEach(option => option.remove());

            // ...New Set(results) нужен для удаления дублей из массива
            Array.from(uniqueLocations, (location: formatedAddressesResponseType, i: number) => {
                const option = document.createElement("option") as HTMLOptionElement;
                option.value = `${i}`;

                if (results.length) {
                    option.innerText = `${location["value"]}`;
                    option.dataset.lat = `${location["lat"]}`;
                    option.dataset.lon = `${location["lon"]}`;
                } else {
                    if ((parentInputBlock.querySelector(".nice-select-search") as HTMLInputElement).value.length) {
                        option.innerText = `Местоположение не найдено`;
                    } else {
                        option.innerText = `Введите местоположение`;
                    }

                    option.dataset["empty"] = "";
                }

                select.insertAdjacentElement("beforeend", option);
            });

            if (niceSelectInstance) {
                (input.closest(".cargo-calc__input") as HTMLDivElement).dataset.oldValue = input.value;

                niceSelectInstance[`${selectIndex}`].update();
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

const currentNumber = `+7 999 120 59 82`;

type DeliveryStatus = 'valid' | 'invalid_weight' | 'calculation_error';

/**
 *
 * @param cost - диста
 * @param status - статус сообщения
 */
const textGenerationHandler = (cost: string, status: DeliveryStatus): string => {
    switch (status) {
        case 'valid':
            return `
                <p class="cargo-calc__delivery-results-text">
                    Стоимость рейса составит примерно 
                    <span class="cargo-calc__delivery-results-text-cost">${cost}</span> 
                    рублей.
                </p>
                <p class="cargo-calc__delivery-results-text">
                    Для более точного расчёта стоимости рейса позвоните нашему менеджеру по телефону 
                    <span style="white-space: nowrap">${currentNumber}</span>, 
                    поскольку нужны дополнительные данные о характере груза.
                </p>
            `
            break
        case 'invalid_weight':
            // Вес вне допустимого диапазона
            return `
                <p class="cargo-calc__delivery-results-text">
                    Вес ${cost} тонн вне допустимого диапазона.
                </p>
                <p class="cargo-calc__delivery-results-text">
                    Пожалуйста, проверьте введённые значения и попробуйте снова.
                </p>
            `;
            break
        case "calculation_error":
            return `
                <p class="cargo-calc__delivery-results-text">
                    К сожалению, не удалось рассчитать стоимость рейса.
                </p>
                <p class="cargo-calc__delivery-results-text">
                    Возможно, выбранный маршрут временно недоступен, либо произошла техническая ошибка.
                    
                    Рекомендуем связаться с нашими специалистами по телефону
                    <span style="white-space: nowrap">${currentNumber}</span> 
                    для уточнения деталей расчета.
                </p>
            `
            break;

    }
}

const showUserResults = (status: string, deliveryCosts: string | number | undefined, form: HTMLFormElement) => {
    const formParent = form.closest(".cargo-calc") as HTMLDivElement;
    const costTextWrapper = formParent.querySelector(".cargo-calc__delivery-results-wrapper") as HTMLSpanElement;

    switch (status) {
        case "valid":
            costTextWrapper.insertAdjacentHTML('afterbegin', textGenerationHandler(deliveryCosts as string, "valid"))
            break;
        case "invalid_weight":
            costTextWrapper.insertAdjacentHTML('afterbegin', textGenerationHandler(deliveryCosts as string, "invalid_weight"))
            break;
        case "calculation_error":
            costTextWrapper.insertAdjacentHTML('afterbegin', textGenerationHandler(deliveryCosts as string, "calculation_error"))
            break;
    }

    formParent.classList.add("cost-calculated");

    // Удаляем disabled с кнопки
    const button = form.querySelector(".cargo-calc__button") as HTMLButtonElement

    if (button && button.tagName === "BUTTON") {
        buttonActiveHandler.enable(button);
    }

    preloader.disable();
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

            console.log(distance);

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
                showUserResults("invalid_weight", cargoWeight, form)
                return false;
            }

            // Берём цену за км согласно категории груза
            const costPerKm = deliveryCosts[category].costPerKm as number;

            // Передаём данные в обработчик результатов и показываем пользователю
            text = String(Math.round((costPerKm * distance) / 1000)*1000);
        }
        // Если у нас ошибка в возвращаемом значении дистации между точками2
    } else {
        text = undefined;
    }

    console.log(text);

    showUserResults(text ? "valid" : "calculation_error", text, form);
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
                            inputErrorHandler(formElement as HTMLInputElement);
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
                                inputErrorHandler(formElement.nextElementSibling as HTMLDivElement);
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
    searchtext: 'Напишите город',
    onSearchInputChanged: (input) => {
        if (debounceInputChange) clearTimeout(debounceInputChange);
        debounceInputChange = setTimeout(onChangedInput, 700, input);
    },
    afterUpdated: (dropdown) => {
        const currentInput = dropdown.querySelector(".nice-select-search") as HTMLSelectElement;

        if (currentInput) {
            const cargoCalcInput = currentInput.closest(".cargo-calc__input") as HTMLInputElement;
            const oldInputValue = cargoCalcInput.dataset.oldValue;

            if (oldInputValue) {
                currentInput.value = oldInputValue;

                cargoCalcInput.dataset.oldValue = "";
            }
        }
    },
    onClickedItem: (item) => {
        if (item) {
            // Проверяем есть ли у него dataset и есть ли dataset со значением - value;
            if (Object.keys(item.dataset).length > 0 && item.dataset.value) {
                const itemIndex = parseInt(item.dataset.value);
                const parentSelect = item.closest(".cargo-calc__input") as HTMLDivElement;

                if (parentSelect) {
                    const erroredElement = parentSelect.querySelector(".input__placeholder.error") as HTMLDivElement;

                    // Удаляем error класс
                    if (erroredElement) {
                        erroredElement.classList.remove("error");
                    }

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
    },
    onClickedSelect: (dropdown) => {
        if (dropdown.classList.contains("error")) {
            dropdown.classList.remove("error");

            const form = dropdown.closest(".cargo-calc__form") as HTMLFormElement;

                // Удаляем disabled с кнопки, если она есть
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
    } else {
        console.error("Кнопка не найдена")
    }
}

cargoCalcButton.addEventListener("click", async (event) => {
    event.preventDefault();

    const button = event.target as HTMLButtonElement

    // TODO тут сделать прелоадер в качестве логотипа, у которого дорога едет, пока грузится карта. На всяк
    preloader.enable();

    if (button && button.tagName === "BUTTON") {
        buttonActiveHandler.disable(button);
    }

    await YMAPLoader(YMapApiKey);

    getCargoFormInputValuesHandler(event.target as HTMLButtonElement);
})
