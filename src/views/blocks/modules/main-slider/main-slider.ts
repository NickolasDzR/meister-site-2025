import Splide from '@splideJs';
import {Options} from "@splidejs/splide/src/js/types/options";

const mainSlider = document.querySelector('.main-slider') as HTMLDivElement;

if (mainSlider) {
    const slides = document.querySelectorAll(".main-slider__slide") as NodeListOf<HTMLLIElement>

    if (slides.length > 0) {
        const mainSliderSplide = mainSlider.querySelector(".main-slider__slider") as HTMLDivElement;
        const slideCounter = mainSlider.querySelector(".main-slider__slide-count") as HTMLDivElement;
        const sliderLength = mainSlider.querySelectorAll(".main-slider__slide:not(.splide__slide--clone)") as NodeListOf<HTMLLIElement>

        const sliderSettings = {
            type: 'loop',
            autoplay: true,
            speed: 600,

        } as Options;

        if (mainSliderSplide) {
            const splideSlider = new Splide(mainSliderSplide, sliderSettings);

            if (slideCounter) {
                splideSlider.on("move", (newIndex) => {
                    slideCounter.textContent = `${ newIndex + 1 } / ${ sliderLength.length }`;
                });
            }

            const progressCircle = mainSlider.querySelector(".main-slider__progress-bar") as SVGAElement;

            if (progressCircle) {
                const dashoffset = 314;

                splideSlider.on("autoplay:playing", (rate) => {
                    console.log(`-${rate * 314}`)
                    progressCircle.style.strokeDashoffset = `-${rate * dashoffset}`;
                })
            }

            splideSlider.mount();

        }
    }
}