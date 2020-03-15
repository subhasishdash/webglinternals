var util = new WebGLUtils();
var canvas = document.getElementById('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
var gl = util.getGLContext(canvas);

var triangleCoords = [0.0, -1.0, 0.0, 1.0, 1.0, -1.0];
//Step1 : Write shaders
var vertexShader = `#version 300 es
precision mediump float;
in vec2 position;
void main () {
    gl_Position = vec4(position, 0.0, 1.0);//x,y,z,w
}`;
var fragmentShader = `#version 300 es
precision mediump float;
out vec4 color;
void main () {
    color = vec4(0.0, 0.0, 1.0, 1.0);//r,g,b,a
}
`;
//Step2 : Create Program from shaders
var program = util.getProgram(gl, vertexShader, fragmentShader);
//Step3 : Create Buffers
var buffer = util.createAndBindBuffer(gl.ARRAY_BUFFER, gl.STATIC_DRAW, new Float32Array(triangleCoords));
//Step4 : Link GPU variable to CPU and sending data
gl.useProgram(program);
var position = util.linkGPUAndCPU({
    program : program,
    gpuVariable : 'position',
    channel : gl.ARRAY_BUFFER,
    buffer : buffer,
    dims : 2,
    dataType : gl.FLOAT,
    normalize : gl.FALSE,
    stride : 0,
    offset : 0
}, gl);
//Step5 : Render Triangle
gl.drawArrays(gl.TRIANGLES, 0, 3);