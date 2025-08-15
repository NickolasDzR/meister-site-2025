<?php get_header(); ?>

<?php
    /*
        Template Name: Шаблон страницы новостей
        Template Post Type: page
    */
    echo 'тут будут список всех блоговых записей (Новости в figma)';
?>

<?php if ( have_posts() ) : while ( have_posts() ) : the_post(); ?>
<p><?php the_title(); ?></p>
<?php endwhile; else: ?>
Записей нет.
<?php endif; ?>

<?php get_footer(); ?>