$(document).ready(function () {
    if ($(window).width() > 768) {
        const $cursor = $('#custom-cursor');
        let mouseX = 0, mouseY = 0;
        let isCursorVisible = true;

        // Отслеживаем движение указателя
        $(document).on('pointermove', function(e) {
            mouseX = e.clientX;
            mouseY = e.clientY;
            
            // Проверяем, вышла ли мышь за верхнюю границу
            if (e.clientY <= 0) {
                if (isCursorVisible) {
                    $cursor.hide();
                    isCursorVisible = false;
                }
            } else {
                if (!isCursorVisible) {
                    $cursor.show();
                    isCursorVisible = true;
                }
            }
        });

        // Плавное обновление позиции
        function updateCursor() {
            if (isCursorVisible) {
                $cursor.css({
                    'transform': `translate(${mouseX}px, ${mouseY}px)`
                });
            }
            requestAnimationFrame(updateCursor);
        }

        updateCursor();

        // Элементы, которые требуют специальный курсор
        const pointerElements = 'a, button, .btn, .carousel-img, .card-share, .letter, .card-description, .menu-item';

        // При наведении — меняем класс
        $(document).on('mouseenter', pointerElements, function () {
            if (isCursorVisible) {
                $cursor.removeClass('cursor-default').addClass('cursor-pointer');
            }
        });

        $(document).on('mouseleave', pointerElements, function () {
            if (isCursorVisible) {
                $cursor.removeClass('cursor-pointer').addClass('cursor-default');
            }
        });
        
        // Скрываем курсор при выходе за пределы окна (не только верхнюю границу)
        $(document).on('mouseleave', function(e) {
            if (e.clientY <= 0 || e.clientX <= 0 || 
                e.clientX >= $(window).width() || e.clientY >= $(window).height()) {
                if (isCursorVisible) {
                    $cursor.hide();
                    isCursorVisible = false;
                }
            }
        });
        
        // Показываем курсор при возвращении в окно
        $(document).on('mouseenter', function() {
            if (!isCursorVisible) {
                $cursor.show();
                isCursorVisible = true;
            }
        });
    }
});