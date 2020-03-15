var utils = new WebGLUtils();
var canvas = document.getElementById('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
var gl = utils.getGLContext(canvas);
gl.clearColor(0.0, 0.0, 0.0, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);

//Step1:
var vertexShader = `#version 300 es
precision mediump float;
in vec2 position;//vertices : WebGL vertex coordinates
in vec2 texCoords;// Texture coordinates
out vec2 textureCoords; //Take input from vertex shader and serve to fragment shader
void main () {
    gl_Position = vec4(position, 0.0, 1.0);
    textureCoords = texCoords;
}
`;

var fragmentShader = `#version 300 es
precision mediump float;
in vec2 textureCoords;
uniform sampler2D uImage, uCode;
uniform float activeIndex;
out vec4 color;
void main() {
    vec4 tex1 = texture(uImage, textureCoords);
    vec4 tex2 = texture(uCode, textureCoords);
    color = mix(tex1, tex2, 0.8);
    /*if (activeIndex == 0.0) {
        color = texture(uImage, textureCoords);
    } else {
        color = texture(uCode, textureCoords);
    }*/

}
`;

//Step2
var program = utils.getProgram(gl, vertexShader, fragmentShader);
//Step3
var vertices = utils.prepareRectVec2(-1.0, 1.0, 1.0, -1.0);
var textureCoordinates = utils.prepareRectVec2(0.0, 0.0, 1.0, 1.0);

var buffer = utils.createAndBindBuffer(gl.ARRAY_BUFFER, gl.STATIC_DRAW, new Float32Array(vertices));
var texBuffer = utils.createAndBindBuffer(gl.ARRAY_BUFFER, gl.STATIC_DRAW, new Float32Array(textureCoordinates));

var mix = document.getElementById('mix');
gl.useProgram(program);
mix.onclick = () => {
    render();
};

var codeTexture, texture;
var image = new Image();
var codeImage = new Image();
codeImage.src = '../Capture.PNG';
codeImage.onload = () => {
    codeTexture = utils.createAndBindTexture(gl, codeImage);
};

image.src = '../courselogo.jpeg';
image.onload = () => {
    texture = utils.createAndBindTexture(gl, image);
};
var uImage = gl.getUniformLocation(program, 'uImage');
var uCode = gl.getUniformLocation(program, 'uCode');
gl.uniform1i(uImage, 0);
gl.uniform1i(uCode, 1);

var render = () => {
    //Step4
    utils.linkGPUAndCPU({program : program, buffer : buffer, dims : 2, gpuVariable : 'position'}, gl);
    utils.linkGPUAndCPU({program : program, buffer : texBuffer, dims : 2, gpuVariable : 'texCoords'}, gl);
    gl.activeTexture(gl.TEXTURE0 + 0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.activeTexture(gl.TEXTURE0 + 1);
    gl.bindTexture(gl.TEXTURE_2D, codeTexture);
    //Step5
    gl.drawArrays(gl.TRIANGLES, 0, vertices.length/2);
};