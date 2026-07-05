// tooltips.js
export function initTooltips() {
    if ($(window).width() > 768) {
        $('.letter:not(#menu_btn_desktop, #menu_btn_mobile)').each((_, letter) => {
            const $letter = $(letter);
            const text = $letter.data('collection');
            $letter.on('mouseenter', () => {
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
                        const verticalText = currentText.split('').join('\n');
                        $tooltip.text(verticalText);
                        index++;
                        setTimeout(type, 50);
                    }
                };
                type();
            }).on('mouseleave', () => $('#dynamic-tooltip').remove());
        });
    }
}