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
}`
//Step2
var program = utils.getProgram(gl, vertexShader, fragmentShader);
//Step3
var vertices = [-0.5, 0.5, 0.5, 0.5, -0.5, -0.5, 0.5, -0.5];
var data = new Float32Array(vertices);
var buffer = utils.createAndBindBuffer(gl.ARRAY_BUFFER, gl.STATIC_DRAW, data);
//Step4 
gl.useProgram(program);
var position = utils.linkGPUAndCPU({
    program : program,
    buffer : buffer,
    gpuVariable : 'position',
    dims : 2
}, gl);
//Step 5 
gl.drawArrays(gl.POINTS, 0, vertices.length/2);