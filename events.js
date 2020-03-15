var initializeEvents = (gl, methodName, method2, zoom) => {
    var canvas = gl.canvas;
    var isDown = false;
    var startX, startY, endX, endY;
    canvas.addEventListener('mouseup', (e) => {
        isDown = false;
        endX = e.offsetX; endY = e.offsetY;
        if (method2) {
            method2(startX, startY, endX, endY);
        }
    });
    canvas.addEventListener('mousedown', (e) => {
        startX = e.offsetX; startY = e.offsetY;
        isDown = true;
    });
    canvas.addEventListener('mousemove', (e) => {
        if (isDown) {
            //dragging
            endX = e.offsetX; endY = e.offsetY;
            if (methodName) {
                methodName(startX, startY, endX, endY);
            }
        }
    });
    canvas.addEventListener('mousewheel', (e) => {
        console.log(e.deltaY);
        if (zoom) {
            zoom(e.deltaY);
        }
    });
};