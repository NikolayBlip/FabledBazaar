$(document).ready(function () {
    // Функция для изменения яркости цвета
    function hexToRgb(hex) {
        let bigint = parseInt(hex.slice(1), 16);
        return {
            r: (bigint >> 16) & 255,
            g: (bigint >> 8) & 255,
            b: bigint & 255
        };
    }

    function rgbToHex(r, g, b) {
        return "#" + [r, g, b].map(x => {
            let hex = Math.round(x).toString(16);
            return hex.length === 1 ? "0" + hex : hex;
        }).join('');
    }

    function adjustBrightness(hex, factor) {
        const rgb = hexToRgb(hex);
        rgb.r = Math.min(255, Math.max(0, Math.round(rgb.r * factor)));
        rgb.g = Math.min(255, Math.max(0, Math.round(rgb.g * factor)));
        rgb.b = Math.min(255, Math.max(0, Math.round(rgb.b * factor)));
        return rgbToHex(rgb.r, rgb.g, rgb.b);
    }

    function fadeOutShadow($element) {
        // Прерываем текущую анимацию пульса
        const requestID = $element.data('pulseAnimationID');
        if (requestID) {
            cancelAnimationFrame(requestID);
            $element.removeData('pulseAnimationID');
        }

        let blur = parseFloat($element.data('currentBlur') || 40);
        let brightness = parseFloat($element.data('currentBrightness') || 1.5);

        function animateFade() {
            let step = 0.05;
            blur -= step * 10;
            brightness -= step;

            if (blur < 0) blur = 0;
            if (brightness < 1) brightness = 1;

            const adjustedColor = adjustBrightness('#9E7ACC', brightness);
            $element.css('box-shadow', `0 0 ${blur}px 5px ${adjustedColor}`);

            if (blur > 0) {
                const newRequestID = requestAnimationFrame(animateFade);
                $element.data('pulseAnimationID', newRequestID);
            } else {
                $element.css('box-shadow', 'none');
                $element.removeData('currentBlur').removeData('currentBrightness');
            }
        }
        
        const initialRequestID = requestAnimationFrame(animateFade);
        $element.data('pulseAnimationID', initialRequestID);
    }

    // Проверяем ширину экрана
    if ($(window).width() > 760) {
        const $card = $('#item-base');
        const $thumbnail = $('.card-main-image');
        const $styleTag = $('<style id="dynamic-card-styles">').appendTo('head');
        const shadowColor = $card.data('collection-color') || '#00ffff';

        let animationId = null;
        let isActive = false;

        // ===== Настройки =====
        const settings = {
            maxRotation: 15,
            liftDistance: 20,
            glareSensitivity: 1.5,
            shadowBlur: 25
        };

        // Оптимизированная функция обновления эффектов
        const updateEffects = (function() {
            let lastUpdate = 0;
            const throttleDelay = 16; // ~60 FPS

            return function(e) {
                if (!isActive) return;
                
                const now = performance.now();
                if (now - lastUpdate < throttleDelay) return;
                lastUpdate = now;

                if (animationId) {
                    cancelAnimationFrame(animationId);
                }

                animationId = requestAnimationFrame(() => {
                    try {
                        const rect = $card[0].getBoundingClientRect();
                        if (rect.width === 0 || rect.height === 0) return;

                        const x = e.clientX - rect.left;
                        const y = e.clientY - rect.top;

                        const w = rect.width;
                        const h = rect.height;

                        const px = Math.floor((100 / w) * x);
                        const py = Math.floor((100 / h) * y);

                        // Позиция градиента и блика
                        const lp = 50 + (px - 50) / settings.glareSensitivity;
                        const tp = 50 + (py - 50) / settings.glareSensitivity;
                        const px_spark = 50 + (px - 50) / 7;
                        const py_spark = 50 + (py - 50) / 7;
                        const p_opc = 20 + Math.abs(50 - px + (50 - py)) * 1.5;

                        // 3D-параллакс
                        const rotateX = ((tp - 50) / 50) * -10;
                        const rotateY = ((lp - 50) / 50) * 10;

                        // Движение картинки
                        const imgShiftX = (px - 50) / 10;
                        const imgShiftY = (py - 50) / 10;

                        // Обновляем динамические стили
                        $styleTag.text(`
                            #item-card:hover::before {
                                background-position: ${lp}% ${tp}%;
                            }
                            #item-card:hover::after {
                                background-position: ${px_spark}% ${py_spark}%;
                                opacity: ${p_opc / 100};
                            }
                        `);

                        // 3D поворот карточки - оптимизировано через transform3d
                        $card.css({
                            'transform': `perspective(3000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(0)`,
                            'will-change': 'transform'
                        });

                        $thumbnail.css({
                            'transform': `translate3d(${imgShiftX}px, ${imgShiftY}px, 0)`,
                            'z-index': '55',
                            'will-change': 'transform'
                        });

                    } catch (error) {
                        console.warn('Error in updateEffects:', error);
                    }
                });
            };
        })();

        function startAnimation(e) {
            isActive = true;
            $card.addClass('active');
            const event = e.type === 'touchstart' ? e.originalEvent.touches[0] : e;
            updateEffects(event);
        }

        function stopAnimation() {
            isActive = false;
            if (animationId) {
                cancelAnimationFrame(animationId);
                animationId = null;
            }
            $card.removeClass('active');
            $styleTag.text('');
            $card.css({
                'transform': '',
                'will-change': ''
            });
            $thumbnail.css({
                'transform': '',
                'z-index': '',
                'will-change': ''
            });
        }

        // Оптимизированные обработчики событий
        $card.on('mouseenter touchstart', startAnimation)
             .on('mouseleave touchend touchcancel', stopAnimation)
             .on('mousemove touchmove', function (e) {
                 e.preventDefault();
                 const event = e.type === 'touchmove' ? e.originalEvent.touches[0] : e;
                 updateEffects(event);
             });

        // Оптимизация для кнопки "показать больше"
        $('#card_showmore').on('click', function () {
            const $desc = $('#card_description');
            const $btn = $(this);
            
            // Используем CSS transition вместо jQuery animate для лучшей производительности
            const isExpanded = $desc.hasClass('expanded');
            
            if (isExpanded) {
                $desc.removeClass('expanded').css('max-height', '105px');
                $btn.css({
                    'transform': 'rotate(0deg)',
                    'bottom': ''
                });
            } else {
                $desc.addClass('expanded').css('max-height', $desc[0].scrollHeight + 'px');
                $btn.css({
                    'transform': 'rotate(180deg)',
                    'bottom': '-30px'
                });
            }
        });
    }

    // Очистка при изменении размера окна
    $(window).on('resize', function() {
        if ($(window).width() <= 760) {
            $('#dynamic-card-styles').remove();
        }
    });
});