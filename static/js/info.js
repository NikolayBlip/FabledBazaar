// info.js
export function showCollectionInfo($collInfo, $collName, $collDesc, collection, descriptions, isMenuOpen, color) {
    if (isMenuOpen) return;
    const current_color = color[collection];
    $collInfo.stop(true).css({ display: 'block', opacity: 0 }).animate({ opacity: 1 }, 300);
    $('.shop-grid').css('margin-top', '50px');
    $collName
        .stop(true)
        .css({ 'opacity': 0, 'color': current_color || '#000000' })
        .text("Коллекция «" + (collection || '') + "»")
        .animate({ opacity: 1 }, 300, () => {
            $collDesc
                .stop(true)
                .css('opacity', 0)
                .text(descriptions[collection] || '')
                .animate({ opacity: 1 }, 500);
        });
}

export function hideCollectionInfo($collInfo, $collName, $collDesc) {
    $collName.stop(true).animate({ opacity: 0 }, 200);
    $collDesc.stop(true).animate({ opacity: 0 }, 200, () => {
        $collInfo.hide();
        $collName.text('');
        $collDesc.text('');
        if ($(window).width() > 768) {
            $('.shop-grid').css('margin-top', '150px');
        } else {
            $('.shop-grid').css('margin-top', '0px');
        }
    });
}