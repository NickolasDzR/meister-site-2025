import Splide from '@splideJs';
import {Options} from "@splidejs/splide/src/js/types/options";

const mainSlider = document.querySelector('.main-slider') as HTMLDivElement;

if (mainSlider) {
    const slides = document.querySelectorAll(".main-slider__slide") as NodeListOf<HTMLLIElement>

    if (slides.length > 0) {
        const mainSliderSplide = mainSlider.querySelector(".main-slider__slider") as HTMLDivElement;

        const sliderSettings = {
            type: 'loop',
            // autoplay: true,
            arrows: true,
            speed: 600,

        } as Options;

        if (mainSliderSplide) {
            const splideSlider = new Splide(mainSliderSplide, sliderSettings)

            splideSlider.mount();
        }
    }
}