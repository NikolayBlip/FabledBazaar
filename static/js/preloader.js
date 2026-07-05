$(document).ready(function() {
    const filesToLoad = [
        'static/letters/A.svg',
        'static/letters/A_red.svg',
        'static/letters/B.svg',
        'static/letters/B_red.svg',
        'static/letters/D.svg',
        'static/letters/D_red.svg',
        'static/letters/E.svg',
        'static/letters/E_red.svg',
        'static/letters/F.svg',
        'static/letters/F_red.svg',
        'static/letters/L.svg',
        'static/letters/L_red.svg',
        'static/letters/R.svg',
        'static/letters/R_red.svg',
        'static/letters/Z.svg',
        'static/letters/Z_red.svg',
        'static/letters/X.svg'
    ];

    function checkResourcesLoaded() {
        let images = $('img');
        let totalImages = images.length;
        let loadedImages = 0;
        let totalFiles = filesToLoad.length;
        let loadedFiles = 0;

        function hidePreloader() {
            if (loadedImages === totalImages && loadedFiles === totalFiles) {
                $('.preloader').addClass('hidden');
                setTimeout(() => $('.preloader').remove(), 500);
            }
        }

        if (totalImages === 0 && totalFiles === 0) {
            $('.preloader').addClass('hidden');
            setTimeout(() => $('.preloader').remove(), 500);
            return;
        }

        images.each(function() {
            let img = new Image();
            img.src = $(this).attr('src');
            img.onload = img.onerror = function() {
                loadedImages++;
                hidePreloader();
            };
        });

        filesToLoad.forEach(file => {
            fetch(file, { method: 'GET', cache: 'no-cache' })
                .then(response => {
                    if (!response.ok) throw new Error(`Failed to load ${file}`);
                    return response.text();
                })
                .then(() => {
                    loadedFiles++;
                    hidePreloader();
                })
                .catch(() => {
                    loadedFiles++;
                    hidePreloader();
                });
        });
    }

    checkResourcesLoaded();

    $(window).on('load', function() {
        console.log('Window fully loaded, ensuring preloader is hidden');
        $('.preloader').addClass('hidden');
        setTimeout(() => $('.preloader').remove(), 500);
    });
});