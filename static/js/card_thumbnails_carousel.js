$(document).ready(function () {
    // 1. Кэшируем все jQuery объекты
    const $thumbs = $('.thumbnails-inner');
    const $modalImage = $('#modal-image');
    const $modalOverlay = $('#modal-overlay');
    const $modalClose = $('#modal-close');
    const $prevModal = $('#prev-modal');
    const $nextModal = $('#next-modal');
    const $carouselImages = $('.carousel-img');

    // 2. Бесконечная прокрутка миниатюр (однократное клонирование)
    if ($thumbs.length) {
        const content = $thumbs[0].innerHTML; // Нативный доступ быстрее
        $thumbs.append(content);
    }

    // 3. Подготовка данных
    let currentIndex = 0;
    const modalImages = [];
    
    // 4. Оптимизированное заполнение массива изображений
    $carouselImages.each(function () {
        modalImages.push(this.src); // Нативный доступ к src быстрее, чем $(this).attr('src')
    });

    // 5. Единый обработчик для открытия модального окна
    $(document).on('click', '.carousel-img', function () {
        const imgSrc = this.src;
        currentIndex = modalImages.indexOf(imgSrc);
        $modalImage.attr('src', imgSrc);
        $modalOverlay.stop(true, true).fadeIn(200); // Останавливаем текущую анимацию
    });

    // 6. Общая функция для навигации
    function navigateModal(direction) {
        if (modalImages.length === 0) return;
        
        currentIndex = (currentIndex + direction + modalImages.length) % modalImages.length;
        $modalImage.attr('src', modalImages[currentIndex]);
        
        // Предзагрузка соседних изображений
        preloadAdjacentImages();
    }

    // 7. Предзагрузка соседних изображений для плавного переключения
    function preloadAdjacentImages() {
        const nextIndex = (currentIndex + 1) % modalImages.length;
        const prevIndex = (currentIndex - 1 + modalImages.length) % modalImages.length;
        
        [modalImages[nextIndex], modalImages[prevIndex]].forEach(src => {
            new Image().src = src;
        });
    }

    // 8. Обработчики навигации
    $prevModal.on('click', function (e) {
        console.log("less");
        e.stopPropagation();
        navigateModal(-1);
    });

    $nextModal.on('click', function (e) {
        e.stopPropagation();
        navigateModal(1);
    });

    // 9. Оптимизированное закрытие модального окна
    function closeModal() {
        $modalOverlay.stop(true, true).fadeOut(200);
        $modalImage.attr('src', '');
    }

    $modalClose.add($modalOverlay).on('click', function (e) {
        if (e.target === $modalOverlay[0] || e.target === $modalClose[0]) {
            closeModal();
        }
    });

    // 10. Обработка клавиатуры для навигации
    $(document).on('keydown', function (e) {
        if (!$modalOverlay.is(':visible')) return;
        
        switch (e.key) {
            case 'ArrowLeft':
                navigateModal(-1);
                break;
            case 'ArrowRight':
                navigateModal(1);
                break;
            case 'Escape':
                closeModal();
                break;
        }
    });
});