import {DynamicLoad} from "@mornya/dynamic-load-libs";

export const capitalizeFirstLetter = (val) => {
    return String(val).charAt(0).toUpperCase() + String(val).slice(1);
}

export const download = {
    async script(path: string, id: string): Promise<any> {
        if (!path || !id) return false;

        return await DynamicLoad.script({
            id: id,
            src: path
        });
    },
}

/**
 * Загружаем YMAP
 */
export const YMAPLoader = async (apikey: string): Promise<any> => {
    if (!apikey) {
        console.error("Нужно передать API key яндекс карт")
    }

    const currentUlr = `https://api-maps.yandex.ru/2.1/?apikey=${apikey}&lang=ru_RU`;

    return await download.script(currentUlr, "ymapInstance")
}

/**
 * Убираем пустые значения в объектах массива
 * @param array
 * @param key
 */
export const removeEmptyValues = (array: Object[], key: string) => array.filter(object => object[key] !== null)

/**
 *
 * @param form
 */
export const inputEventHandler = (form: HTMLElement) => {
    if (form) {

    } else {
        console.error("Нужно передать форму с инпутами")
    }
}

export const buttonActiveHandler = {
    disable: (button: HTMLButtonElement) => {

    },
    enable: (button: HTMLButtonElement) => {

    }
}