$(document).ready(function () {
    // === 0. Проверка типа устройства ===
    const isDesktop = $(window).width() > 720;

    // === 1. Общие переменные ===
    const $shopGrid = $('.shop-grid');
    const $shopItems = $('.shop-item');
    const $collInfo = $('.collection-info');
    const $collName = $('.coll-name');
    const $collDesc = $('.coll-desc');
    const $menu = $('.menu');
    let activeCollection = null;
    let isFiltering = false;
    let isMenuOpen = false;

    // Инициализация меню (общая логика)
    $menu.css({
        opacity: 0,
        zIndex: -1,
        display: 'flex'
    });
    resetAllMenuItems(true);

    // Цвета и описания коллекций (общие данные)
    const collections_colors = {
        "Exlibris": "#F9F6EC",
        "All Hallows Eve": "#FEF0E1",
        "Zodiac": "#EBF8FF",
        "Lucky items": "#F0FFE1",
        "Alchimia": "#F2F0FF",
        "Baby dream": "#FFEBF2",
        "Futurism": "#ECF8F9",
        "Amore": "#FFEAE5",
        "Beast": "#F9F2EC"
    };
    const collectionDescriptions = {
        "Exlibris": "Эксклюзивная коллекция книжных экслибрисов, созданных вручную известными художниками.",
        "All Hallows Eve": "Мистическая коллекция предметов, вдохновленная древними традициями Хэллоуина.",
        "Zodiac": "Астрологическая коллекция, где каждый знак зодиака представлен через призму искусства.",
        "Lucky items": "Собрание макгаффинов, которые притягивают удачу, словно магниты, обещая везение в каждом миге.",
        "Alchimia": "Коллекция, вдохновленная древним искусством алхимии.",
        "Baby dream": "Нежная коллекция для самых маленьких, создающая атмосферу волшебных снов.",
        "Futurism": "Футуристическая коллекция, опережающая время.",
        "Amore": "Романтическая коллекция, посвященная вечной теме любви.",
        "Beast": "Дикая коллекция, вдохновленная миром животных."
    };

    // === 2. Основные функции ===
    // 2.1. Управление меню (общая логика)
    function toggleMenu() {
        isMenuOpen = !isMenuOpen;
        const $menuBtns = $('#menu_btn_desktop, #menu_btn_mobile');
        if (isMenuOpen) {
            // Открытие меню
            $menuBtns.removeClass('gecco').addClass('X');
            $menu.css('zIndex', 9).stop(true).animate({ opacity: 1 }, 300);
        } else {
            // Закрытие меню
            resetAllMenuItems(true);
            $menu.stop(true).animate({ opacity: 0 }, 300, function () {
                $(this).css('zIndex', -1);
            });
            $menuBtns.removeClass('X').addClass('gecco');
            // Восстанавливаем информацию о коллекции, если она активна (только для десктопа)
            if (isDesktop && activeCollection) {
                $collInfo.stop(true).css({
                    display: 'block',
                    opacity: 1
                });
                // Не вызываем showCollectionInfo() чтобы избежать повторной анимации
            }
        }
    }

    // 2.2. Управление информацией о коллекции (только для десктопа)
    if (isDesktop) {
        $shopGrid.css('margin-top', '50px');
    }

    function showCollectionInfo(collection) {
        // Выполняется только на десктопе
        if (!isDesktop || isMenuOpen) return;
        $collInfo.stop(true).css({
            display: 'block',
            opacity: 0
        }).animate({ opacity: 1 }, 300);
        $collName.text(collection);
        typeText(collectionDescriptions[collection], $collDesc, 30);
    }

    function hideCollectionInfo() {
        // Выполняется только на десктопе
        if (!isDesktop) return;
        $collInfo.stop(true).animate({ opacity: 0 }, 300, function () {
            $(this).hide();
        });
        $collName.text('');
        $collDesc.text('');
    }

    // 2.3. Фильтрация коллекций (только для десктопа)
    function filterCollection(collection) {
        // Выполняется только на десктопе
        if (!isDesktop) {
            // Для мобильных просто переключаем видимость элементов без анимаций
            activeCollection = collection;
            $shopItems.each(function () {
                const $item = $(this);
                $item.toggle(!collection || $item.data('collection') === collection);
            });
            return;
        }

        isFiltering = true;
        activeCollection = collection;
        $shopGrid.css({
            filter: 'blur(8px) saturate(0) brightness(1.5)',
            WebkitFilter: 'blur(8px) saturate(0) brightness(1.5)'
        });
        $shopItems.stop(true).each(function (index) {
            const $item = $(this);
            setTimeout(() => {
                $item.toggle(!collection || $item.data('collection') === collection);
            }, index * 20);
        });
        setTimeout(() => {
            isFiltering = false;
            if (!$("#shop_menu").is(':hover')) {
                $shopGrid.css({
                    filter: 'none',
                    WebkitFilter: 'none'
                });
            }
        }, $shopItems.length * 20 + 300);
    }

    // === 3. Вспомогательные функции ===
    function resetAllMenuItems(instant) {
        $('.menu a').each(function () {
            const $item = $(this);
            const $wrapper = $item.find('.content-wrapper');
            if (instant) {
                $wrapper.css({
                    height: '0',
                    opacity: '0'
                });
            } else {
                $wrapper.stop(true).animate({
                    height: '0',
                    opacity: '0'
                }, 300);
            }
            $item.css('transform', 'translateY(0)').removeClass('active');
        });
    }

    function typeText(text, $element, speed) {
        // Выполняется только на десктопе
        if (!isDesktop) return;
        $element.text('');
        let i = 0;
        const typing = () => {
            if (i < text.length) {
                $element.text($element.text() + text.charAt(i++));
                setTimeout(typing, speed);
            }
        };
        typing();
    }

    // === 4. Обработчики событий ===
    $(document)
        .on('click', '.letter:not(#menu_btn_desktop, #menu_btn_mobile)', function () {
            // if (isMenuOpen) return; // Убрано, чтобы позволить кликать на буквы даже при открытом меню
            const $letter = $(this);
            const selectedCollection = $letter.data('collection');
            if (!selectedCollection) return;

            // Сбрасываем все X и восстанавливаем оригинальные классы
            $('.letter').not('#menu_btn_desktop, #menu_btn_mobile').each(function () {
                const $btn = $(this);
                if ($btn.hasClass('X')) {
                    const oldClass = $btn.data('original-class');
                    if (oldClass) $btn.removeClass('X').addClass(oldClass);
                }
            });

            if (activeCollection === selectedCollection) {
                // Сброс фильтра при повторном клике на активную коллекцию
                filterCollection(null);
                if (isDesktop) { // Только на десктопе
                    hideCollectionInfo();
                    $('body, .gecco').css('background-color', '#F7F5F3');
                    $(".shop-menu").css('background-image', 'linear-gradient(to bottom, #F7F5F3, rgba(147, 112, 231, 0))');
                }
                activeCollection = null;
                return;
            }

            // Устанавливаем новый активный фильтр
            const classAttr = $letter.attr('class');
            const currentClass = classAttr ? classAttr.split(' ').filter(cls => !['letter', 'X'].includes(cls)).join(' ').trim() : '';
            if (currentClass) {
                $letter.data('original-class', currentClass).removeClass(currentClass).addClass('X');
            }

            // Изменение фона и вызов фильтрации только на десктопе
            if (isDesktop) {
                const color = collections_colors[selectedCollection];
                $('body, .gecco').css('background-color', color);
                $(".shop-menu").css('background-image', `linear-gradient(to bottom, ${color}, rgba(147, 112, 231, 0))`);
                filterCollection(selectedCollection);
                showCollectionInfo(selectedCollection);
                $('html, body').animate({ scrollTop: 0 }, 400);
            } else {
                // Для мобильных просто фильтруем без анимаций
                filterCollection(selectedCollection);
            }
        })
        .on('click', '#menu_btn_desktop, #menu_btn_mobile', function (e) {
            e.stopPropagation();
            toggleMenu();
        })
        .on('click', '.menu a h2', function (e) {
            e.stopPropagation();
            if (!isMenuOpen) return;
            const $item = $(this).parent();
            const $wrapper = $item.find('.content-wrapper');
            const $content = $wrapper.find('p'); // Находим блок с контентом
            const isActive = $item.hasClass('active');
            if (isActive) {
                // Закрытие пункта меню
                $wrapper.stop(true).animate({
                    height: '0',
                    opacity: '0'
                }, 300, function () {
                    $wrapper.css('display', 'none');
                    $item.nextAll('a').css('transform', 'translateY(0)');
                });
                $item.removeClass('active');
            } else {
                // Открытие пункта меню
                resetAllMenuItems();
                $item.addClass('active');
                $wrapper.css({
                    display: 'block',
                    height: 'auto'
                });
                const contentHeight = $content.outerHeight(true);
                $wrapper.css('height', '0')
                    .stop(true)
                    .animate({
                        height: contentHeight,
                        opacity: '1'
                    }, 400);
            }
        });

    // Ховер эффекты для меню (только для десктопа)
    if (isDesktop) {
        $('#shop_menu').hover(
            () => !isFiltering && $shopGrid.css({
                filter: 'blur(8px) saturate(0) brightness(1.5)',
                WebkitFilter: 'blur(8px) saturate(0) brightness(1.5)'
            }),
            () => !isFiltering && $shopGrid.css({
                filter: 'none',
                WebkitFilter: 'none'
            })
        );
    }

    // Инициализация tooltips (только для десктопа)
    if (isDesktop) {
        $('.letter:not(#menu_btn_desktop, #menu_btn_mobile)').each(function () {
            const $letter = $(this);
            const text = $letter.data('collection');
            $letter.on('mouseenter', function () {
                if (!text || text.length < 2) return;
                const offset = $letter.offset();
                let $tooltip = $('#dynamic-tooltip').length ? $('#dynamic-tooltip') :
                    $('<p>').attr('id', 'dynamic-tooltip').addClass('header-coll-name goudy').appendTo('body');
                $tooltip.css({
                    top: offset.top + $letter.outerHeight(),
                    left: offset.left + $letter.outerWidth() / 2,
                    opacity: 1
                }).text('');
                let index = 0;
                const fullText = text.substring(1);
                const type = () => {
                    if (index <= fullText.length) {
                        const currentText = fullText.substring(0, index);
                        const verticalText = currentText.split('').join('\n'); // Исправлено: \n вместо '
'
                        $tooltip.text(verticalText);
                        index++;
                        setTimeout(type, 10);
                    }
                };
                type();
            }).on('mouseleave', () => $('#dynamic-tooltip').remove());
        });
    }
});
