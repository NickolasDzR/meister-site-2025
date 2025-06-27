import Splide from '@splideJs';
import {Options} from "@splidejs/splide/src/js/types/options";
import {Intersection} from '@splidejs/splide-extension-intersection';
import {AutoplayComponent, Components} from "@splidejs/splide";

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

            interval: 4000,
            speed: 600,
            pagination: false,
            pauseOnHover: false,
            pauseOnFocus: false,
            intersection: {
                inView: {
                    autoplay: true,
                },
                outView: {
                    autoplay: false,
                },
            },

        } as Options;

        if (mainSliderSplide) {
            const splideSlider = new Splide(mainSliderSplide, sliderSettings);

            const dashoffset = 314;

            if (slideCounter) {
                splideSlider.on("move", (newIndex) => {
                    slideCounter.textContent = `${newIndex + 1} / ${sliderLength.length}`;
                });
            }

            let sliderAutoplayComp: AutoplayComponent | undefined = undefined;

            // Если у нас есть автоплей, значит делаем активным заполняющийся кружок навигации стрелки
            if (sliderSettings.autoplay && sliderSettings.interval) {
                const progressCircle = mainSlider.querySelector(".main-slider__progress-bar") as SVGAElement;

                let ratePause = false;

                if (progressCircle) {
                    // Если поставилась пауза, то анимировано убираем svg circle и после снова стартуем autoplay
                    splideSlider.on("autoplay:pause", (ev) => {
                        setTimeout(() => {
                            if (sliderAutoplayComp) {
                                sliderAutoplayComp.play();
                                progressCircle.style.transitionDuration = ``;
                            }
                        }, 400)

                        progressCircle.style.transitionDuration = `${400}ms`;
                    })

                    splideSlider.on("autoplay:playing", (rate, hov) => {
                        progressCircle.style.strokeDashoffset = `${dashoffset - (rate * dashoffset) === dashoffset ? '-' + dashoffset : dashoffset - (rate * dashoffset)}`;

                        // Если анимации подошла к концу и слайд собирается смениться, то ставим паузу
                        if (rate === 1) {
                            if (sliderAutoplayComp) {
                                sliderAutoplayComp.pause();
                            }
                        }
                    });

                    const navigationButtons = document.querySelectorAll(".main-slider__arrow") as NodeListOf<HTMLButtonElement>;

                    Array.from(navigationButtons).forEach(button => {
                        button.addEventListener("click", () => {
                            if (sliderAutoplayComp) sliderAutoplayComp.pause()

                        })
                    })
                }
            }


            splideSlider.mount({Intersection});

            const {Autoplay} = splideSlider.Components as Components;

            sliderAutoplayComp = Autoplay;
        }
    }
}