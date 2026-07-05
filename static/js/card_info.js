$(document).ready(function() {
    const $cardDesc = $('#card_description');
    const $itemCard = $('.item-card');
    const $gridContainer = $('.grid-container');
    const $scrollingBox = $('.card-scrolling-box');
    const $notification = $('#copy-notification');
    const $shareButton = $('.card-share');
    const COLLAPSED_HEIGHT = 105;
    const EXPANDED_HEIGHT = 350;
    
    let isExpanded = false;
    let notificationTimeout = null;
    let isNotificationVisible = false;
    let isShareAnimating = false;
    
    // Проверяем, существует ли элемент уведомления
    if ($notification.length === 0) {
        console.error('Элемент #copy-notification не найден в DOM');
        // Создаем элемент динамически если его нет
        const notificationHTML = `
            <div id="copy-notification" class="copy-notification">
                <div class="notification-content">
                    <svg class="notification-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M20 6L9 17L4 12" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <span class="notification-text">Ссылка скопирована</span>
                </div>
            </div>
        `;
        $('body').append(notificationHTML);
        $notification = $('#copy-notification');
    }
    
    // Функция анимации иконки
    function animateShareIcon() {
        if (isShareAnimating) return; // Предотвращаем повторную анимацию
        
        isShareAnimating = true;
        $shareButton.addClass('animate');
        
        setTimeout(() => {
            $shareButton.removeClass('animate');
            isShareAnimating = false;
        }, 500);
    }
    
    // Функция показа уведомления
    function showNotification() {
        console.log('Показываем уведомление');
        
        // Очищаем предыдущий таймер
        if (notificationTimeout) {
            clearTimeout(notificationTimeout);
            notificationTimeout = null;
        }
        
        // Если уведомление уже видимо, сначала скрываем его
        if (isNotificationVisible) {
            hideNotification();
            
            // Показываем новое уведомление после небольшой задержки
            setTimeout(() => {
                showNewNotification();
            }, 50);
        } else {
            showNewNotification();
        }
    }
    
    // Внутренняя функция для показа нового уведомления
    function showNewNotification() {
        // Сбрасываем стили для новой анимации
        $notification.css({
            'display': 'block',
            'visibility': 'visible',
            'opacity': '0',
            'transform': 'translateY(-20px)'
        });
        
        // Даем браузеру время для отрисовки
        setTimeout(() => {
            $notification.css({
                'opacity': '1',
                'transform': 'translateY(-85px)'
            });
            isNotificationVisible = true;
        }, 10);
        
        // Устанавливаем новый таймер на 2 секунды
        notificationTimeout = setTimeout(() => {
            hideNotification();
        }, 2000);
    }
    
    // Функция скрытия уведомления
    function hideNotification() {
        if (notificationTimeout) {
            clearTimeout(notificationTimeout);
            notificationTimeout = null;
        }
        
        if (!isNotificationVisible) return;
        
        $notification.css({
            'opacity': '0',
            'transform': 'translateY(-20px)'
        });
        
        // После анимации скрываем элемент
        setTimeout(() => {
            $notification.css('visibility', 'hidden');
            isNotificationVisible = false;
        }, 300);
    }
    
    // Обработчик клика по кнопке "Поделиться"
    document.querySelector('.card-share').addEventListener('click', function(e) {
        e.preventDefault();
        
        // Если анимация уже идет - игнорируем клик
        if (isShareAnimating) return;
        
        // Запускаем анимацию иконки
        animateShareIcon();
        
        const linkElement = document.querySelector('#card_VK a');
        
        if (!linkElement) {
            console.error('Элемент ссылки не найден');
            return;
        }
        
        const link = linkElement.href;
        
        // Проверяем поддержку современного Clipboard API
        if (navigator.clipboard && window.isSecureContext) {
            // Современный метод
            navigator.clipboard.writeText(link).then(function() {
                console.log('Ссылка скопирована: ' + link);
                showNotification();
            }).catch(function(err) {
                console.error('Ошибка копирования: ', err);
            });
        } else {
            // Fallback для старых браузеров
            if (fallbackCopyTextToClipboard(link)) {
                showNotification();
            }
        }
    });

    function fallbackCopyTextToClipboard(text) {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        
        // Избегаем прокрутки
        textArea.style.top = "0";
        textArea.style.left = "0";
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
        
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            const successful = document.execCommand('copy');
            document.body.removeChild(textArea);
            if (successful) {
                console.log('Ссылка скопирована: ' + text);
                return true;
            } else {
                console.error('Ошибка копирования');
                return false;
            }
        } catch (err) {
            console.error('Ошибка копирования: ', err);
            document.body.removeChild(textArea);
            return false;
        }
    }

    function toggleDescription() {
        if (isExpanded) {
            // Сворачиваем - возвращаем исходное состояние
            $cardDesc.css({
                'height': COLLAPSED_HEIGHT + 'px',
                'overflow': 'hidden'
            });
            
            $gridContainer.css('display', 'grid');
            $scrollingBox.css('display', 'block');
        } else {
            // Разворачиваем - устанавливаем фиксированную высоту 350px
            $cardDesc.css({
                'height': EXPANDED_HEIGHT + 'px',
                'overflow-y': 'auto'
            });
            
            $gridContainer.css('display', 'none');
            $scrollingBox.css('display', 'none');
        }
        
        isExpanded = !isExpanded;
    }
    
    // Инициализация начального состояния
    $cardDesc.css({
        'height': COLLAPSED_HEIGHT + 'px',
        'overflow': 'hidden'
    });
    
    // Обработчик клика
    $cardDesc.on('click', function() {
        toggleDescription();
    });
});