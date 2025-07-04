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
        },
    ]
}