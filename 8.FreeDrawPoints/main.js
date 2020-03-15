var utils = new WebGLUtils();
var canvas = document.getElementById('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
var gl = utils.getGLContext(canvas);
//Step1: shaders
var vertexShader = `#version 300 es
precision mediump float;
in vec2 position;
uniform float flipY;
void main() {
    gl_Position = vec4(position.x, position.y * flipY, 0.0, 1.0);
    gl_PointSize = 10.0;
}`;
var fragmentShader = `#version 300 es
precision mediump float;
out vec4 color;
uniform vec4 inputColor;
void main () {
    color = inputColor;
}`;

//Step2
var program = utils.getProgram(gl, vertexShader, fragmentShader);

var vertices = [];
initializeEvents(gl, (startX, startY, endX, endY) => {
    //Step3
    var coordsObj = {
        startX : startX, startY : startY,
        endX : endX, endY : endY
    };
    var v = utils.getGPUCoords(coordsObj);
    vertices.push(v.startX, v.startY, v.endX, v.endY);
    var data = new Float32Array(vertices);
    var buffer = utils.createAndBindBuffer(gl.ARRAY_BUFFER, gl.STATIC_DRAW, data);

    //Step4
    gl.useProgram(program);
    utils.linkGPUAndCPU({
        program : program,
        buffer : buffer,
        dims : 2,
        gpuVariable : 'position'
    }, gl);

    var flipY = gl.getUniformLocation(program, 'flipY');
    var inputColor = gl.getUniformLocation(program, 'inputColor');
    gl.uniform1f(flipY, -1.0);
    gl.uniform4fv(inputColor, [Math.random(), Math.random(), Math.random(), 1.0]);
    //Step5
    gl.drawArrays(gl.POINTS, 0, vertices.length/2);
});