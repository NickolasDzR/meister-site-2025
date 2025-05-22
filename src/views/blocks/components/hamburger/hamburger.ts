const hamburger = document.querySelector('.hamburger') as HTMLButtonElement;
const mobNav = document.querySelector(".js-hamburger-activator") as HTMLDivElement;
const tabNav = document.querySelector(".header__tab-nav") as HTMLDivElement;

if (hamburger && mobNav) {
    let togglerBool = false;

    hamburger.addEventListener('click', () => {
        togglerBool = !togglerBool;

        hamburger.classList[togglerBool ? 'add' : 'remove']('is-active');


        // Нужно для того, чтобы в >= 768 разрешении появлялся попап и убиралось меню по очереди.
        setTimeout(() => {
            mobNav.classList[togglerBool ? 'add' : 'remove']("active");
        }, togglerBool ? 300 : 0);

        setTimeout(() => {
            tabNav.classList[togglerBool ? 'add' : 'remove']("disable");
        }, togglerBool ? 0 : 300);
    })
}
