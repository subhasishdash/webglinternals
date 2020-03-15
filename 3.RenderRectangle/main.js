var utils = new WebGLUtils();
var canvas = document.getElementById('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
var gl = utils.getGLContext(canvas);

//Step1: Writing Shaders
var vertexShader = `#version 300 es
precision mediump float;
in vec2 position;
void main () {
    gl_Position = vec4(position, 0.0, 1.0);
}`;
var fragmentShader = `#version 300 es
precision mediump float;
out vec4 color;
void main () {
    color = vec4(0.0, 1.0, 0.0, 1.0);
}`;

//Step 2 : Creating Program
var program = utils.getProgram(gl, vertexShader, fragmentShader);
//Step3 : Creating buffers
var data = new Float32Array([-0.7, -0.7, 0.7, 0.7, -0.7, 0.7,
                            -0.7, -0.7, 0.7, 0.7, 0.7, -0.7]);
var buffer = utils.createAndBindBuffer(gl.ARRAY_BUFFER, gl.STATIC_DRAW, data);

//Step4 : LInking of CPU and GPU
gl.useProgram(program);
var position = utils.linkGPUAndCPU({
    program : program,
    gpuVariable : 'position',
    channel : gl.ARRAY_BUFFER,
    buffer : buffer,
    dims : 2,
    dataType : gl.FLOAT,
    normalize : gl.FALSE,
    stride : 0, 
    offset : 0
});

//Step 5 : Render the rectangle
gl.drawArrays(gl.TRIANGLES, 0, 6);