<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>'123123'</title>
    <meta name="theme-color" content="#fff">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta name="viewport" content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
    <!--link(rel="preload" media="(min-width: 420px)" href="css/media-xs.css" as="style")-->
    <!--link(rel="preload" media="(min-width: 576px)" href="css/media-sm.css" as="style")-->
    <!--link(rel="preload" media="(min-width: 767px)" href="css/media-md.css" as="style")-->
    <!--link(rel="preload" media="(min-width: 992px)" href="css/media-lg.css" as="style")-->
    <!--link(rel="preload" media="(min-width: 1280px)" href="css/media-xl.css" as="style")-->
    <script src="https://api-maps.yandex.ru/2.1/?apikey=8015e492-aa36-4f9e-83b5-e5a5dbb3e45b&lang=ru_RU"></script>

    <?php wp_head();?>
</head>
<body>
<header class="header">
    <div class="container">
        <div class="row">
            <div class="logo header__logo">
                <?php
                    if (has_custom_logo()) {
                        echo get_custom_logo();
                    }
                ?>
            </div>
            <div class="header__tab-nav d-none d-md-flex">
                <nav class="nav header__nav d-none d-xl-block">
                    <?php
                        wp_nav_menu( [
                            'theme_location'  => 'header',
                            'container'       => 'nav',
                            'container_class' => 'nav',
                            'menu_class'      => 'nav__list',
                            'echo'            => true,
                            'items_wrap'      => '<ul id="%1$s" class="%2$s">%3$s</ul>',
                        ] );
                    ?>
                </nav>
                <div class="soc header__soc">
                    <ul class="soc__list">
                        <li class="soc__item"><a class="soc__link" href="#">
                            <svg class="soc__svg soc__svg_ws">
                                <use xlink:href="img/sprite.e2992a3301c6f575734d..svg#ws"></use>
                            </svg>
                        </a></li>
                        <li class="soc__item"><a class="soc__link" href="#">
                            <svg class="soc__svg soc__svg_tg">
                                <use xlink:href="img/sprite.e2992a3301c6f575734d..svg#tg"></use>
                            </svg>
                        </a></li>
                        <li class="soc__item"><a class="soc__link" href="#">
                            <svg class="soc__svg soc__svg_vk">
                                <use xlink:href="img/sprite.e2992a3301c6f575734d..svg#vk"></use>
                            </svg>
                        </a></li>
                    </ul>
                </div>
                <div class="contacts header__contacts">
                    <ul class="contacts__list">
                        <li class="contacts__item"><a class="contacts__link-title" href="#">+7 (999) 120 59 82</a><a
                                class="contacts__link-subtitle" href="#">nickolasdzr@yandex.ru</a></li>
                    </ul>
                </div>
            </div>
            <button class="hamburger header__hamburger" type="button"><SPAN class="hamburger-box"><SPAN
                    class="hamburger-inner"></SPAN></SPAN></button>
            <div class="header__mob-nav d-xl-none js-hamburger-activator">
                <nav class="nav header__nav">
                    <ul class="nav__list">
                        <li class="nav__item"><a class="nav__link" href="#">Новости</a></li>
                        <li class="nav__item"><a class="nav__link" href="#">Расчитать доставку</a></li>
                        <li class="nav__item"><a class="nav__link" href="#">Контакты</a></li>
                    </ul>
                </nav>
                <div class="contacts header__contacts">
                    <ul class="contacts__list">
                        <li class="contacts__item"><a class="contacts__link-title" href="#">+7 (999) 120 59 82</a><a
                                class="contacts__link-subtitle" href="#">nickolasdzr@yandex.ru</a></li>
                    </ul>
                </div>
                <div class="soc header__soc">
                    <ul class="soc__list">
                        <li class="soc__item"><a class="soc__link" href="#">
                            <svg class="soc__svg soc__svg_ws">
                                <use xlink:href="img/sprite.e2992a3301c6f575734d..svg#ws"></use>
                            </svg>
                        </a></li>
                        <li class="soc__item"><a class="soc__link" href="#">
                            <svg class="soc__svg soc__svg_tg">
                                <use xlink:href="img/sprite.e2992a3301c6f575734d..svg#tg"></use>
                            </svg>
                        </a></li>
                        <li class="soc__item"><a class="soc__link" href="#">
                            <svg class="soc__svg soc__svg_vk">
                                <use xlink:href="img/sprite.e2992a3301c6f575734d..svg#vk"></use>
                            </svg>
                        </a></li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
</header>