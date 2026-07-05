$(document).ready(function() {
    // Настройки
    if ($(window).width() > 768) {
        var settings = {
            grainOpacity: 0.03,     // Прозрачность шума
            grainSize: 2,           // Размер зерна (в пикселях)
            updateInterval: 50,    // Интервал обновления (мс) - чем больше, тем медленнее
            color: false            // Цветной (true) или черно-белый (false)
        };
    } else {
        var settings = {
            grainOpacity: 0.03,     // Прозрачность шума
            grainSize: 1,           // Размер зерна (в пикселях)
            updateInterval: 50,    // Интервал обновления (мс) - чем больше, тем медленнее
            color: false            // Цветной (true) или черно-белый (false)
        }; 
    }
    
    // Создаем canvas
    var noiseCanvas = $('<canvas id="noiseCanvas"></canvas>').css({
        'position': 'fixed',
        'top': '0',
        'left': '0',
        'width': '100%',
        'height': '100%',
        'opacity': settings.grainOpacity,
        'z-index': '9999',
        'pointer-events': 'none'
    });
    
    $('body').append(noiseCanvas);
    var canvas = noiseCanvas[0];
    var ctx = canvas.getContext('2d');
    
    var bufferWidth, bufferHeight;
    
    function setup() {
        bufferWidth = Math.ceil(window.innerWidth / settings.grainSize);
        bufferHeight = Math.ceil(window.innerHeight / settings.grainSize);
        
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    
    function generateNoise() {
        var buffer = document.createElement('canvas');
        buffer.width = bufferWidth;
        buffer.height = bufferHeight;
        var bCtx = buffer.getContext('2d');
        var imageData = bCtx.createImageData(bufferWidth, bufferHeight);
        var data = imageData.data;
        
        for (var i = 0; i < data.length; i += 4) {
            if (settings.color) {
                data[i] = Math.floor(Math.random() * 255);     // R
                data[i+1] = Math.floor(Math.random() * 255);   // G
                data[i+2] = Math.floor(Math.random() * 255);   // B
            } else {
                var val = Math.floor(Math.random() * 255);
                data[i] = data[i+1] = data[i+2] = val;
            }
            data[i+3] = 255; // Alpha
        }
        
        bCtx.putImageData(imageData, 0, 0);
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(buffer, 0, 0, bufferWidth, bufferHeight, 
                      0, 0, canvas.width, canvas.height);
    }
    
    var noiseInterval;
    function startNoise() {
        if (noiseInterval) clearInterval(noiseInterval);
        noiseInterval = setInterval(generateNoise, settings.updateInterval);
    }
    
    $(window).on('resize', function() {
        setup();
        generateNoise();
    });
    
    setup();
    generateNoise();
    startNoise();
    
    function updateSettings(newSettings) {
        settings = $.extend(settings, newSettings);
        noiseCanvas.css('opacity', settings.grainOpacity);
        setup();
        startNoise();
    }
    
});