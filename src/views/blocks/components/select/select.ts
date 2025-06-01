import NiceSelect from "nice-select2";
import {ClassWatcher} from "@classWatcher";

const selects = document.querySelectorAll(".input__placeholder_select") as NodeListOf<HTMLSelectElement>;

const onAddedClass = () => {
    console.log(onAddedClass)
}

const onRemoveClass = () => {
    console.log(onRemoveClass)
}

const newSelectSettings = {
    searchable: true,
    placeholder: 'Выберите город'
}

if (selects.length > 0) {
    Array.from(selects, (select) => {
        new NiceSelect(document.querySelector(".input__placeholder_select") as HTMLSelectElement, newSelectSettings);

        new ClassWatcher('tag', select, 'open', onAddedClass, onRemoveClass)
    })
}