var utils = new WebGLUtils();
var canvas = document.getElementById('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
var gl = utils.getGLContext(canvas);

//Step1 : Writing Shader
var vertexShader = `#version 300 es
precision mediump float;
in vec2 position;
void main() {
    gl_Position = vec4(position, 0.0, 1.0);
}`;
var fragmentShader = `#version 300 es
precision mediump float;
out vec4 color;
void main() {
    color = vec4(0.0, 1.0, 0.0, 1.0);
}`;
//Step-2
var program = utils.getProgram(gl, vertexShader, fragmentShader);
//Step-3
var vertices = [-0.6, 0.6, 0.6, 0.6, -0.6, -0.6, 0.6, -0.6];
var data = new Float32Array(vertices);
var buffer = utils.createAndBindBuffer(gl.ARRAY_BUFFER, gl.STATIC_DRAW, data);
//Step-4
gl.useProgram(program);
var position = utils.linkGPUAndCPU({
    program : program,
    buffer : buffer,
    gpuVariable : 'position',
    channel : gl.ARRAY_BUFFER,
    stride : 0,
    offset : 0,
    dims : 2,
    dataType : gl.FLOAT,
    normalize : gl.FALSE
}, gl);
//Step5 
gl.drawArrays(gl.LINES, 0, vertices.length/2);