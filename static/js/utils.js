export function typeText(text, $element, speed) {
    if ($(window).width() > 768) {
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
}