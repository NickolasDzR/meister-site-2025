<?php

/* Поддержка импорта SVG файлов */
function cc_mime_types($mimes) {
  $mimes['svg'] = 'image/svg+xml';
  return $mimes;
}
add_filter('upload_mimes', 'cc_mime_types');
/* Поддержка импорта SVG файлов */

if (!function_exists('tk_meister_setup')) {
    function tk_meister_setup() {
        /* Подключаем пользовательский логотип */
        add_theme_support( 'custom-logo', [
            'height'      => null,
            'width'       => null,
            'flex-width'  => true,
            'flex-height' => true,
            'header-text' => '',
            'unlink-homepage-logo' => false, // WP 5.5
        ] );
        /* Подключаем логотип */
    }
    add_action('after_setup_theme', 'tk_meister_setup');
}


/* Подключение стилей и скриптов */
add_action( 'wp_enqueue_scripts', 'tk_meister_styles_and_scripts' );

function tk_meister_styles_and_scripts() {
	wp_enqueue_style( 'tk-meister-reset-style', get_template_directory_uri() .  '/dist/reset.css', array());
	wp_enqueue_style( 'tk-meister-style', get_template_directory_uri() .  '/dist/main.css', array('tk-meister-reset-style'));

	wp_enqueue_script( 'tk-meister-runtime-script', get_template_directory_uri() .  '/dist/runtime.js', array(), null, true);
	wp_enqueue_script( 'tk-meister-script', get_template_directory_uri() .  '/dist/main.js', array('tk-meister-runtime-script'), null, true);
}
/* Подключение стилей и скриптов */

/* Регестрируем сразу несколько областей меню */
function tk_meister_menus() {
    // Собираем несколько зон меню
    $locations = array(
        'header' => __('Header Menu', 'tk_meister'),
        'footer' => __('Footer Menu', 'tk_meister'),
    );

    // Регистрируем области меню, которые лежат в переменной $location
    register_nav_menus($locations);
}

// хук-событие
add_action('init', 'tk_meister_menus');



// Добавим класс к nav li items элементам меню
add_filter('nav_menu_css_class', 'custom_nav_menu_css_class', 10, 1);

function custom_nav_menu_css_class($classes) {
    // Добавляем к списку классов свой класс nav-item
    $classes[] = 'nav__item';

    // Возвращаем список классов уже с нашим классом
    return $classes;
}

// Добавим класс к nav link (a href) элементам items меню
add_filter('nav_menu_link_attributes', 'custom_nav_menu_link_attributes', 10, 2);

function custom_nav_menu_link_attributes($atts, $depth) {
    $atts['class'] = 'nav__link';

    return $atts;
}
?>
