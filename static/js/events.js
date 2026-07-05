// events.js
import { toggleMenu, resetAllMenuItems } from './menu.js';
import { showCollectionInfo, hideCollectionInfo } from './info.js';

export function bindEvents(shopManager) {
    const $backgroundBlocker = $('#background_blocker');
    let isTransitioning = false;
    let contentTimeoutId = null;

    // === Управление блокером ===
    function updateBlockerState() {
        if ($(window).width() > 768) {
            const isHovered = $('#shop_menu').is(':hover');
            const shouldShow = shopManager.isFiltering || isHovered;

            if (shouldShow) {
                $backgroundBlocker.css({ display: 'block', zIndex: 10, opacity: 0 })
                    .stop(true).animate({ opacity: 1 }, 150);
            } else {
                $backgroundBlocker.stop(true).animate({ opacity: 0 }, 150, () => {
                    $backgroundBlocker.css({ display: 'none', zIndex: -1 });
                });
            }
        }
    }

    shopManager.updateBlockerState = updateBlockerState;

    // === Наведение на меню ===
    $('#shop_menu').on('mouseenter mouseleave', function () {
        if (!shopManager.isFiltering) {
            updateBlockerState();
        }
    });

    // === Показ контента (товары, название, описание) ===
    function showContent() {
        if (contentTimeoutId) {
            clearTimeout(contentTimeoutId);
            contentTimeoutId = null;
        }

        const $content = $('.shop-grid, .coll-name, .coll-desc');
        $content.css('opacity', 0).show(); // Сначала show(), потом opacity
        contentTimeoutId = setTimeout(() => {
            $content.css('opacity', 1);
        }, 50);
    }

    // === Скрытие контента (при открытии меню) ===
    function hideContent() {
        if (contentTimeoutId) {
            clearTimeout(contentTimeoutId);
            contentTimeoutId = null;
        }

        const $content = $('.shop-grid, .coll-name, .coll-desc');
        $content.css('opacity', 0);
        contentTimeoutId = setTimeout(() => {
            $content.hide();
        }, 300); // Должно совпадать с временем CSS-перехода
    }

    // === Клик по букве-коллекции ===
    $(document).on('click', '.letter:not(#menu_btn_desktop, #menu_btn_mobile)', function (e) {
        if (isTransitioning) return;

        const $letter = $(this);
        const selectedCollection = $letter.data('collection');

        if (!selectedCollection) return;

        // Если меню открыто — закрываем его и показываем контент
        if (shopManager.isMenuOpen) {
            isTransitioning = true;

            shopManager.isMenuOpen = toggleMenu(
                shopManager.$menu,
                $('#menu_btn_desktop, #menu_btn_mobile'),
                shopManager.isMenuOpen,
                resetAllMenuItems
            );

            showContent();

            setTimeout(() => (isTransitioning = false), 400);
        }

        // === Сброс или установка коллекции ===
        if (shopManager.activeCollection === selectedCollection) {
            shopManager.filterCollection(null);
            shopManager.hideCollectionInfo();

            $('body').css('background-color', '#F7F5F3');
            if ($(window).width() > 768) {
                $('.shop-menu').css('background-image', `linear-gradient(to bottom, #F7F5F3, rgba(147, 112, 231, 0))`);
            } else {
                $('.shop-menu').css('background-image', 'none');
            }

            const originalClass = $letter.data('original-class');
            if (originalClass) {
                $letter.removeClass('X').addClass(originalClass);
            } else {
                $letter.removeClass('X');
            }

            shopManager.activeCollection = null;
            return;
        }

        // Сброс всех X
        $('.letter').not('#menu_btn_desktop, #menu_btn_mobile').each((_, btn) => {
            const $btn = $(btn);
            if ($btn.hasClass('X')) {
                const oldClass = $btn.data('original-class');
                if (oldClass) {
                    $btn.removeClass('X').addClass(oldClass);
                }
            }
        });

        // Устанавливаем X
        const currentClass = $letter.attr('class')
            .split(' ')
            .filter(cls => !['letter', 'X'].includes(cls))
            .join(' ')
            .trim();

        if (currentClass) {
            $letter.data('original-class', currentClass).removeClass(currentClass).addClass('X');
        } else {
            $letter.addClass('X');
        }

        // Фон
        const color = shopManager.collections_colors[selectedCollection];
        $('body').css('background-color', color);
        if ($(window).width() > 768) {
            $('.shop-menu').css('background-image', `linear-gradient(to bottom, ${color}, rgba(147, 112, 231, 0))`);
        } else {
            $('.shop-menu').css('background-image', 'none');
        }

        shopManager.filterCollection(selectedCollection);
        shopManager.showCollectionInfo(selectedCollection);
        shopManager.activeCollection = selectedCollection;

        $('html, body').animate({ scrollTop: 0 }, 400);
    });

    // === Клик по кнопке меню ===
    $(document).on('click', '#menu_btn_desktop, #menu_btn_mobile', function (e) {
        e.stopPropagation();

        if (isTransitioning) return;
        isTransitioning = true;

        const $btn = $(this);
        const currentClass = $btn.attr('class')
            .split(' ')
            .filter(cls => !['letter', 'X', 'active'].includes(cls))
            .join(' ')
            .trim();

        // --- Сброс фильтрации при ОТКРЫТИИ меню ---
        if (!shopManager.isMenuOpen) {
            if (shopManager.activeCollection) {
                shopManager.filterCollection(null);
                shopManager.hideCollectionInfo();

                $('body').css('background-color', '#F7F5F3');
                if ($(window).width() > 768) {
                    $('.shop-menu').css('background-image', `linear-gradient(to bottom, #F7F5F3, rgba(147, 112, 231, 0))`);
                } else {
                    $('.shop-menu').css('background-image', 'none');
                }

                const $activeLetter = $('.letter.X').not('#menu_btn_desktop, #menu_btn_mobile');
                if ($activeLetter.length) {
                    const originalClass = $activeLetter.data('original-class');
                    if (originalClass) {
                        $activeLetter.removeClass('X').addClass(originalClass);
                    } else {
                        $activeLetter.removeClass('X');
                    }
                }

                shopManager.activeCollection = null;
            }

            hideContent();
        }

        // --- Переключение X-класса ---
        if (!shopManager.isMenuOpen) {
            if (currentClass) {
                $btn.data('original-class', currentClass);
            }
            $btn.removeClass(currentClass).addClass('X');
        } else {
            const originalClass = $btn.data('original-class');
            if (originalClass) {
                $btn.removeClass('X').addClass(originalClass);
            } else {
                $btn.removeClass('X');
            }
        }

        // --- Переключение меню ---
        const wasMenuOpen = shopManager.isMenuOpen;
        shopManager.isMenuOpen = toggleMenu(
            shopManager.$menu,
            $('#menu_btn_desktop, #menu_btn_mobile'),
            shopManager.isMenuOpen,
            resetAllMenuItems
        );

        // === 🔥 КРИТИЧЕСКИЕ ИЗМЕНЕНИЯ НИЖЕ ===

        // Если меню должно быть открыто, НО toggleMenu() не сделал его видимым — принудительно показываем
        if (shopManager.isMenuOpen) {
            $('#menu').show(); // Принудительно показываем
        } else if (!shopManager.isMenuOpen && !wasMenuOpen) {
            // Это случай, если toggleMenu не переключил состояние
            console.warn('Menu did not open. Forcing show...');
            $('#menu').show();
            shopManager.isMenuOpen = true;
        }

        // Показ контента при закрытии
        if (!shopManager.isMenuOpen) {
            showContent();
        }

        setTimeout(() => {
            isTransitioning = false;
        }, 400);
    });
}