export interface DadataJson {
    "source": string,
    "result": string,
    "postal_code": string,
    "country": string,
    "region": string,
    "city_area": string,
    "city_district": string,
    "street": string,
    "house": string,
    "geo_lat": string,
    "geo_lon": string,
    "qc_geo": number
}

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