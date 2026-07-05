export function toggleMenu($menu, $menuBtns, isMenuOpen, resetAllMenuItems) {
    isMenuOpen = !isMenuOpen;
    
    if ($(window).width() > 768) { 
        if (isMenuOpen) {
            $menuBtns.removeClass('gecco').addClass('X');
            $menu.css('zIndex', 9).stop(true).animate({ opacity: 1 }, 300);
            $('body').css('overflow', 'hidden'); 
        } else {
            resetAllMenuItems(true);
            $menu.stop(true).animate({ opacity: 0 }, 300, () => {
                $menu.css('zIndex', -1);
            });
            $menuBtns.removeClass('X').addClass('gecco');
            $('body').css('overflow', 'auto'); // Разблокируем скролл
        }
    } else {
        if (isMenuOpen) {
            $menuBtns.removeClass('Burger').addClass('X');
            $menu.css('zIndex', 9).stop(true).animate({ opacity: 1 }, 300);
            $('body').css('overflow', 'hidden');
        } else {
            resetAllMenuItems(true);
            $menu.stop(true).animate({ opacity: 0 }, 300, () => {
                $menu.css('zIndex', -1);
            });
            $menuBtns.removeClass('X').addClass('Burger');
            $('body').css('overflow', 'auto'); 
        }
    }
    
    return isMenuOpen;
}

export function resetAllMenuItems(instant) {
    $('.menu a').each((_, item) => {
        const $item = $(item);
        const $wrapper = $item.find('.content-wrapper');
        if (instant) {
            $wrapper.css({ height: '0', opacity: '0', display: 'none' });
        } else {
            $wrapper.stop(true).animate({ height: '0', opacity: '0' }, 300, () => {
                $wrapper.css('display', 'none');
            });
        }
        $item.css('transform', 'translateY(0)').removeClass('active');
    });
}