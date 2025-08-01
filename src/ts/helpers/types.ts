export interface niceSelect2Instance {
    update: Function;
    "el": HTMLElement,
    "config": {
        "data": boolean | null,
        "searchable": boolean,
        "showSelectedItems": boolean,
        "placeholder": string
    },
    "data": [
        {
            "text": string
            "value": string,
            "selected": boolean,
            "disabled": boolean
        }
    ],
    "selectedOptions": [],
    "placeholder": string,
    "searchtext": string,
    "selectedtext": string,
    "dropdown": {},
    "multiple": boolean,
    "disabled": boolean,
    "options": [
        {
            "data": {
                "text": string,
                "value": string,
                "selected": boolean,
                "disabled": boolean
            },
            "attributes": {
                "selected": boolean,
                "disabled": boolean,
                "optgroup": boolean
            },
            "element": {}
        }
    ]
}

export interface addressesResponseType {
    "suggestions": [
        {
            "city_with_type": string,
            "geo_lat": "string",
            "geo_lon": "string",
        },
    ]
}

export interface formatedAddressesResponseType {
    "value": string,
    "lon"?: string,
    "lat"?: string,
}

export interface SelectSettings {
    /** Включает возможность поиска по списку */
    searchable: boolean;

    /** Подсказывающий текст-плейсхолдер для поля поиска */
    placeholder: string;

    /**
     * Колбэк-функция, вызываемая при изменении значения поля поиска.
     * @param input Текущее значение поля поиска.
     */
    onSearchInputChanged?: (input: HTMLInputElement) => void;

    /**
     * Колбэк-функция, вызываемая после обновления компонента.
     * @param dropdown Элемент, представляющий компонент выпадающего списка.
     */
    afterUpdated?: (dropdown: Element) => void;

    /**
     * Колбэк-функция, вызываемая после клика на найденый город
     * @param item
     */
    onClickedItem?: (item: HTMLLIElement) => void;
}

export interface valueFormElementsTypes {
    "location_0": string[],
    "location_1": string[],
    "weight": string
}

export type WeightCategory = 'upTo2Tons' | 'from2to5Tons' | 'from5to10Tons' | 'from10to20Tons';

export interface DeliveryCostConfig {
    minWeight: number;
    maxWeight: number;
    costPerKm: number;
}