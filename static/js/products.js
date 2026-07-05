$(document).ready(function () {
    const $blocker = $('#background_blocker');
    const $detailContainer = $('#product-detail');
    $('.shop-item').on('click', function () {
        const productId = $(this).data('id');
        $detailContainer.empty();
        $detailContainer.html('<p></p>');

        $.ajax({
            url: `/api/product-card/${productId}`,
            method: 'GET',
            success: function (html) {
                $detailContainer.empty().append(html);
                $detailContainer.addClass('card-forward').removeClass('card-backward');
                $('.shop-grid').css("filter", "opacity(0.5)");
                $blocker.fadeIn(200);
            },
            error: function (xhr, status, error) {
                console.error("Ошибка загрузки карточки:", error);
                $detailContainer.html('<p>Не удалось загрузить карточку товара.</p>');
            }
        });
    });

    $(document).on('click', '#card_close', function () {
        console.log("click");
        $blocker.fadeOut(200);
        $detailContainer.removeClass('card-forward').addClass('card-backward');
        $('.shop-grid').css("filter", "opacity(1)");

        setTimeout(function () {
            $detailContainer.empty();
        }, 500);
    });

    $(document).on('click', '.shop-item', function () {

        if ($(window).width() > 768) { 
            $blocker.css({
                display: 'block',
                zIndex: 1000,
                opacity: 0,
            }).stop(true).animate({ opacity: 1 }, 300);

        } else {
            $blocker.css({
                display: 'block',
                zIndex: 1000,
                opacity: 0,
                'backdrop-filter': 'brightness(0.5)'
            }).stop(true).animate({ opacity: 1 }, 300);

        }
    });
});