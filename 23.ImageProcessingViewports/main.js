var utils = new WebGLUtils();
var canvas = document.getElementById('canvas');
canvas.width = window.innerWidth * 0.80;
canvas.height = window.innerHeight * 0.80;
var gl = canvas.getContext('webgl2', {preserveDrawingBuffer : true});
gl.clearColor(0.0, 0.0, 0.0, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);

var kernels = {
    edgeEnhancement : [-1, -1, -1, -1, 10, -1, -1, -1, -1]
};

//Step1:
var vertexShader = `#version 300 es
precision mediump float;
in vec2 position;//vertices : WebGL vertex coordinates
in vec2 texCoords;// Texture coordinates
out vec2 textureCoords; //Take input from vertex shader and serve to fragment shader
void main () {
    gl_Position = vec4(position.x, position.y * -1.0, 0.0, 1.0);
    textureCoords = texCoords;
}
`;

var fragmentShader = `#version 300 es
precision mediump float;
in vec2 textureCoords;
uniform sampler2D uImage, uColorPalette;
uniform float activeIndex, uKernel[9], kernelWeight;
out vec4 color;
uniform bool isGrayscale, isInverse, isKernel, isColorPalette;
vec4 applyKernel () {
    ivec2 dims = textureSize(uImage, 0);
    vec2 pixelJumpFactor = 1.0/vec2(dims);
    vec4 values =
    texture(uImage, textureCoords + pixelJumpFactor * vec2(-1, -1)) * uKernel[0] +
    texture(uImage, textureCoords + pixelJumpFactor * vec2(0, -1)) * uKernel[1] + 
    texture(uImage, textureCoords + pixelJumpFactor * vec2(1, -1)) * uKernel[2] + 
    texture(uImage, textureCoords + pixelJumpFactor * vec2(-1,  0)) * uKernel[3] +
    texture(uImage, textureCoords + pixelJumpFactor * vec2(0,  0)) * uKernel[4] + 
    texture(uImage, textureCoords + pixelJumpFactor * vec2(1,  0)) * uKernel[5] + 
    texture(uImage, textureCoords + pixelJumpFactor * vec2(-1,  1)) * uKernel[6] + 
    texture(uImage, textureCoords + pixelJumpFactor * vec2(0,  1)) * uKernel[7] + 
    texture(uImage, textureCoords  + pixelJumpFactor * vec2(1,  1)) * uKernel[8];
    
    vec4 updatedPixels = vec4(vec3((values/kernelWeight).rgb), 1.0);
    return updatedPixels;
}
void main() {
    vec4 tex1 = texture(uImage, textureCoords);
    if (isGrayscale) {
        float newPixelVal = tex1.r * 0.59 +  tex1.g * 0.30 +  tex1.b * 0.11;
        tex1 = vec4(vec3(newPixelVal), 1.0);
    } else if (isInverse) {
        tex1 = vec4(1.0 - tex1.rgb, 1.0);
    } else if (isKernel) {
        tex1 = applyKernel();
    } else if (isColorPalette) {
        tex1 = texture(uColorPalette, vec2(1.0 - tex1.r, 0.0));
    }
    color = tex1;//vec4(vec3(textureCoords.x), 1.0);
}
`;

//Step2
var program = utils.getProgram(gl, vertexShader, fragmentShader);
//Step3
var currSX = -1.0, currSY = -1.0, currEX = 1.0 , currEY = 1.0;
var lastSX = -1.0, lastSY = -1.0, lastEX = 1.0 , lastEY = 1.0;
var vertices = utils.prepareRectVec2(currSX, currSY, currEX, currEY);
var textureCoordinates = utils.prepareRectVec2(0.0, 0.0, 1.0, 1.0);

var buffer = utils.createAndBindBuffer(gl.ARRAY_BUFFER, gl.STATIC_DRAW, new Float32Array(vertices));
var texBuffer = utils.createAndBindBuffer(gl.ARRAY_BUFFER, gl.STATIC_DRAW, new Float32Array(textureCoordinates));

var getCoords = () => {
    var obj = {
        startX : AR.x1, startY : AR.y1, endX : AR.x2, endY : AR.y2
    };
    return utils.getGPUCoords(obj); //-1 to +1
};

var texture, paletteTex;
var AR = null;
var image = new Image();
var colorImage = new Image();
image.src = '../4KSample.jpg';
colorImage.src = '../ColorPalette.jpg';
colorImage.onload = () => {
    paletteTex = utils.createAndBindTexture(gl, colorImage);
    image.onload = () => {
       // AR = utils.getAspectRatio(gl, image);
       // var v = getCoords();
       // vertices = utils.prepareRectVec2(v.startX, v.startY, v.endX, v.endY);
        buffer = utils.createAndBindBuffer(gl.ARRAY_BUFFER, gl.STATIC_DRAW, new Float32Array(vertices));
        texture = utils.createAndBindTexture(gl, image);
        render(0, 0, gl.canvas.width, gl.canvas.height);
    };
};
gl.useProgram(program);
var uImage = gl.getUniformLocation(program, 'uImage');
var uColorPalette = gl.getUniformLocation(program, 'uColorPalette');
gl.uniform1i(uImage, 0);
gl.uniform1i(uColorPalette, 1);

var render = (x, y, width, height) => {
    //Step4
    utils.linkGPUAndCPU({program : program, buffer : buffer, dims : 2, gpuVariable : 'position'}, gl);
    utils.linkGPUAndCPU({program : program, buffer : texBuffer, dims : 2, gpuVariable : 'texCoords'}, gl);
    gl.activeTexture(gl.TEXTURE0 + 0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.activeTexture(gl.TEXTURE0 + 1);
    gl.bindTexture(gl.TEXTURE_2D, paletteTex);
    //Step5
    gl.viewport(x, y, width, height);
    gl.drawArrays(gl.TRIANGLES, 0, vertices.length/2);
};


var grayscale = document.getElementById('grayscale');
var inverse = document.getElementById('inverse');
var reset = document.getElementById('reset');
var kernel = document.getElementById('kernel');
var palette = document.getElementById('palette');
var isGrayscale = gl.getUniformLocation(program, 'isGrayscale');
var isInverse = gl.getUniformLocation(program, 'isInverse');
var isKernel = gl.getUniformLocation(program, 'isKernel');
var isColorPalette = gl.getUniformLocation(program, 'isColorPalette');

var resetAll = () => {
    gl.uniform1f(isKernel, 0.0);
    gl.uniform1f(isInverse, 0.0);
    gl.uniform1f(isColorPalette, 0.0);
    gl.uniform1f(isGrayscale, 0.0);
};

grayscale.onclick = () => {
    var v1 = performance.now();
    resetAll();
    gl.uniform1f(isGrayscale, 1.0);
    render(0, 0, gl.canvas.width/2, gl.canvas.height/2);
    var v2 = performance.now();
    console.log(v2 - v1);
};

palette.onclick = () => {
    var v1 = performance.now();
    resetAll();
    gl.uniform1f(isColorPalette, 1.0);
    render(gl.canvas.width/2, gl.canvas.height/2, gl.canvas.width/2, gl.canvas.height/2);
    var v2 = performance.now();
    console.log(v2 - v1);
};

kernel.onclick = () => {
    resetAll();
    gl.uniform1f(isKernel, 1.0);
    var kernelWeight = gl.getUniformLocation(program, 'kernelWeight');
    var ker = gl.getUniformLocation(program, 'uKernel[0]');
    gl.uniform1f(kernelWeight, kernels.edgeEnhancement.reduce((a, b) => a + b));
    gl.uniform1fv(ker, kernels.edgeEnhancement);
    render(0, gl.canvas.height/2, gl.canvas.width/2, gl.canvas.height/2);
};

inverse.onclick = () => {
    var v1 = performance.now();
    resetAll();
    gl.uniform1f(isInverse, 1.0);
    render(gl.canvas.width/2, 0, gl.canvas.width/2, gl.canvas.height/2);
    var v2 = performance.now();
    console.log(v2 - v1);
};

reset.onclick = () => {
    resetAll();
    render(0, 0, gl.canvas.width, gl.canvas.height);
};