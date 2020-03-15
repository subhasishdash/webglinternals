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
}`;
var fragmentShader = `#version 300 es
precision mediump float;
out vec4 color;
uniform vec3 inputColor;
void main () {
    color = vec4(inputColor, 1.0);
}`;

//Step2 
var program = utils.getProgram(gl, vertexShader, fragmentShader);

initializeEvents(gl, (startX, startY, endX, endY) => {
    //Step 3
    var coordsObj = {
        startX : startX, startY : startY,
        endX : endX, endY : endY
    };
    var v = utils.getGPUCoords(coordsObj);
    var vertices = [v.startX, v.startY, v.endX, v.endY];
    var data = new Float32Array(vertices);
    var buffer = utils.createAndBindBuffer(gl.ARRAY_BUFFER, gl.STATIC_DRAW, data);

    //Step4
    gl.useProgram(program);
    utils.linkGPUAndCPU({
        program : program,
        buffer : buffer,
        gpuVariable : 'position',
        dims : 2
    }, gl);
    var flipY = gl.getUniformLocation(program, 'flipY');
    var inputColor = gl.getUniformLocation(program, 'inputColor');
    gl.uniform1f(flipY, -1.0);
    gl.uniform3fv(inputColor, [Math.random(), Math.random(), Math.random()]);
    //Step5
    gl.drawArrays(gl.LINES, 0, vertices.length/2);

































});
//Step3