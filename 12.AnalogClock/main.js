var utils = new WebGLUtils();
var canvas = document.getElementById('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
var gl = utils.getGLContext(canvas);
gl.clearColor(0.0, 0.0, 0.0, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
//Step1: shaders
var vertexShader = `#version 300 es
precision mediump float;
in vec2 position;
void main() {
    gl_Position = vec4(position, 0.0, 1.0);
    gl_PointSize = 2.0;
}`;
var fragmentShader = `#version 300 es
precision mediump float;
out vec4 color;
uniform vec3 inputColor;
void main () {
    color = vec4(inputColor, 1.0);
}`;
//Step 2 : 
var program = utils.getProgram(gl, vertexShader, fragmentShader);

//Step3:
var circleVertices = utils.getCircleCoordinates(0.0, 0.0, 0.3, 500);
var buffer = utils.createAndBindBuffer(gl.ARRAY_BUFFER, gl.STATIC_DRAW, new Float32Array(circleVertices));

var secondsVertices = utils.getCircleCoordinates(0.0, 0.0, 0.27, 60);
var pointsBuffer = utils.createAndBindBuffer(gl.ARRAY_BUFFER, gl.STATIC_DRAW, new Float32Array(secondsVertices));

var secondsBuffer = utils.createAndBindBuffer(gl.ARRAY_BUFFER, gl.STATIC_DRAW, 
    new Float32Array(utils.getCircleCoordinates(0.0, 0.0, 0.27, 60, true)));

var minuteBuffer = utils.createAndBindBuffer(gl.ARRAY_BUFFER, gl.STATIC_DRAW, 
        new Float32Array(utils.getCircleCoordinates(0.0, 0.0, 0.24, 60, true)));

var hourBuffer = utils.createAndBindBuffer(gl.ARRAY_BUFFER, gl.STATIC_DRAW, 
            new Float32Array(utils.getCircleCoordinates(0.0, 0.0, 0.18, 60, true)));       

//Step4:

var getLineCoords = (input) => {
    var index = 0;
    var start = 15;
    if (input < start) {
        index = start - input;
    } else {
        index = 60 - input + start;
    }
    return index * 2;
};

setInterval( () => {
    var d = new Date();
    var hours = d.getHours() > 12 ? (d.getHours() - 12) : d.getHours();
    var minutes = d.getMinutes();
    var seconds = d.getSeconds();
    gl.useProgram(program);
    utils.linkGPUAndCPU({
        program : program,
        buffer : buffer, 
        dims : 2,
        gpuVariable : 'position'
    }, gl);
    var inputCol = gl.getUniformLocation(program, 'inputColor');
    gl.uniform3fv(inputCol, [1.0, 0.1, 0.5]);


    //Step5
    gl.drawArrays(gl.POINTS, 0, circleVertices.length/2);
    utils.linkGPUAndCPU({
        program : program,
        buffer : pointsBuffer, 
        dims : 2,
        gpuVariable : 'position'
    }, gl);
    gl.drawArrays(gl.POINTS, 0, secondsVertices.length/2);


    utils.linkGPUAndCPU({
        program : program,
        buffer : secondsBuffer, 
        dims : 2,
        gpuVariable : 'position'
    }, gl);
    gl.drawArrays(gl.LINES, getLineCoords(seconds), 2);
    utils.linkGPUAndCPU({
        program : program,
        buffer : minuteBuffer, 
        dims : 2,
        gpuVariable : 'position'
    }, gl);
    gl.drawArrays(gl.LINES, getLineCoords(minutes), 2);

    utils.linkGPUAndCPU({
        program : program,
        buffer : hourBuffer, 
        dims : 2,
        gpuVariable : 'position'
    }, gl);
    gl.drawArrays(gl.LINES, getLineCoords(hours * 5 + Math.floor(minutes/60)), 2);
}, 1000);