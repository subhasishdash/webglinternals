var utils = new WebGLUtils();
var canvas = document.getElementById('canvas');
var imageData, ctx;
var image = new Image();
image.src = '../4KSample.jpg';
image.onload = () => {
    canvas.width = image.width;
    canvas.height = image.height;
    canvas.style.height = (window.innerHeight * 0.90) + 'px';
    ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0);
    imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
};

var grayscale = document.getElementById('grayscale');
var inverse = document.getElementById('inverse');
var reset = document.getElementById('reset');

grayscale.onclick = () => {
    var v1 = performance.now();
    var data = imageData.data;
    for (var i = 0; i < data.byteLength; i = i + 4) {
        var newPixelVal = data[i] * 0.59 +  data[i + 1] * 0.30 +  data[i + 2] * 0.11;
        data[i] = data[i + 1] = data[i + 2] = newPixelVal;
        data[i + 3] = 255;
    }
    ctx.putImageData(imageData, 0, 0);
    var v2 = performance.now();
    console.log(v2 - v1);
};

inverse.onclick = () => {
    var v1 = performance.now();
    var data = imageData.data;
    for (var i = 0; i < data.byteLength; i = i + 4) {
        data[i] = 255 - data[i];
        data[i + 1] = 255 - data[i + 1];
        data[i + 2] = 255 - data[i + 2];
        data[i + 3] = 255;
    }
    ctx.putImageData(imageData, 0, 0);
    var v2 = performance.now();
    console.log(v2 - v1);
};

reset.onclick = () => {
    ctx.drawImage(image, 0, 0);
};