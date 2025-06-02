import NiceSelect from "nice-select2";
import {ClassWatcher} from "@classWatcher";
import {logger} from "@prettier/plugin-pug";

const selects = document.querySelectorAll(".input__placeholder_select") as NodeListOf<HTMLSelectElement>;
const url = "https://cleaner.dadata.ru/api/v2/clean/address";
const token = "3f637eb956c800c700b18d79bb1fb687cdcb2b94";
const secret = "28deeea55b3c9720d891d81b5c7797b94026d4d3";

var dadataOptions = {
    method: "POST",
    mode: "cors",
    headers: {
        "Content-Type": "application/json",
        "Authorization": "Token " + token,
        "X-Secret": secret
    },
    body: JSON.stringify(['Мос'])
}

    const onAddNewTag = async() => {
    console.log("asdsads")
    // @ts-ignore
    const res = await fetch(url, dadataOptions)

    const json = await res.json();

        console.log(json)
}

const newSelectSettings = {
    searchable: true,
    placeholder: 'Выберите город'
}

if (selects.length > 0) {
    Array.from(selects, (select) => {
        const currentInput = select.closest(".input") as HTMLDivElement;
        new ClassWatcher('tag', currentInput, 'open', onAddNewTag)

        new NiceSelect(document.querySelector(".input__placeholder_select") as HTMLSelectElement, newSelectSettings);


    })
}