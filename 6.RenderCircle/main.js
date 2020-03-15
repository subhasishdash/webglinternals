var utils = new WebGLUtils();
var canvas = document.getElementById('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
var gl = utils.getGLContext(canvas);

//Step1: shaders
var vertexShader = `#version 300 es
precision mediump float;
in vec2 position;
void main() {
    gl_Position = vec4(position, 0.0, 1.0);
    gl_PointSize = 10.0;
}`;
var fragmentShader = `#version 300 es
precision mediump float;
out vec4 color;
void main () {
    color = vec4(0.0, 0.0, 1.0, 1.0);
}`;
//Step 2 : 
var program = utils.getProgram(gl, vertexShader, fragmentShader);
//Step 3 :
var getCircleCoordinates = () => {
    var centerX = 0.0, centerY = 0.0, radiusX = 0.4;
    var numOfPoints = 3000;
    var circleCoords = [];
    var radiusY = radiusX/gl.canvas.height * gl.canvas.width;
    for (var i = 0; i < numOfPoints; i++) {
        //2*Math.PI*r
        var circumference = 2 * Math.PI * (i/numOfPoints);
        var x = centerX + radiusX * Math.cos(circumference);
        var y = centerY + radiusY * Math.sin(circumference);
        circleCoords.push(x, y);
    }
    return circleCoords;
};
var vertices = getCircleCoordinates();
var data = new Float32Array(vertices);
var buffer = utils.createAndBindBuffer(gl.ARRAY_BUFFER, gl.STATIC_DRAW, data);

//Step4 :
gl.useProgram(program);
var position = utils.linkGPUAndCPU({
    program : program,
    dims : 2, 
    buffer : buffer,
    gpuVariable : 'position'
}, gl);

//Step5
gl.drawArrays(gl.LINES, 0, vertices.length/2);
//gl.drawArrays(gl.POINTS, 0, vertices.length/2);