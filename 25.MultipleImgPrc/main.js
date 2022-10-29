var utils = new WebGLUtils();
var canvas = document.getElementById('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
var gl = utils.getGLContext(canvas);
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
uniform float flipY;
void main () {
    gl_Position = vec4(position.x, position.y * flipY, 0.0, 1.0);
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
        getFbs(gl, image);
        AR = utils.getAspectRatio(gl, image);
        var v = getCoords();
        vertices = utils.prepareRectVec2(v.startX, v.startY, v.endX, v.endY);
        buffer = utils.createAndBindBuffer(gl.ARRAY_BUFFER, gl.STATIC_DRAW, new Float32Array(vertices));
        texture = utils.createAndBindTexture(gl, image);

        //Step4
        utils.linkGPUAndCPU({program : program, buffer : buffer, dims : 2, gpuVariable : 'position'}, gl);
        utils.linkGPUAndCPU({program : program, buffer : texBuffer, dims : 2, gpuVariable : 'texCoords'}, gl);
        gl.activeTexture(gl.TEXTURE0 + 0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.activeTexture(gl.TEXTURE0 + 1);
        gl.bindTexture(gl.TEXTURE_2D, paletteTex);
        render();
    };
    image.onerror = (err) => console.log(err);
};

gl.useProgram(program);
var uImage = gl.getUniformLocation(program, 'uImage');
var uColorPalette = gl.getUniformLocation(program, 'uColorPalette');
var flipY = gl.getUniformLocation(program, 'flipY');
gl.uniform1i(uImage, 0);
gl.uniform1i(uColorPalette, 1);
gl.uniform1f(flipY, -1);

var render = (fb) => {
    //Step5
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

var addFilter = (filter) => {
    var idx = filters.indexOf(filter);
    if (idx === -1) {
        filters.push(filter);
    }
};

let filters = [];
let framebuffers = [];


var getFbs = () => {
    framebuffers.push(utils.createAndBindFramebuffer(gl, image));
    framebuffers.push(utils.createAndBindFramebuffer(gl, image));
};

var updateVertices = (currSX, currSY, currEX, currEY) => {
    vertices = utils.prepareRectVec2(currSX, currSY, currEX, currEY);
    buffer = utils.createAndBindBuffer(gl.ARRAY_BUFFER, gl.STATIC_DRAW, new Float32Array(vertices));
    utils.linkGPUAndCPU({program : program, buffer : buffer, dims : 2, gpuVariable : 'position'}, gl);
};

const applyImgPrc = (filter) => {
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
    gl.viewport(0, 0, image.width, image.height);
    gl.activeTexture(gl.TEXTURE0 + 0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    updateVertices(currSX, currSY, currEX, currEY);
    gl.uniform1f(flipY, 1.0);
    addFilter(filter);
    let counter = 0;
    for (let i = 0; i < filters.length; i++) {
        resetAll();
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffers[counter % 2].fb);
        switch (filters[i]) {   
            case 'grayscale' : gl.uniform1f(isGrayscale, 1.0); break;
            case 'palette' : gl.uniform1f(isColorPalette, 1.0); break;
            case 'kernel' : gl.uniform1f(isKernel, 1.0);
                            var kernelWeight = gl.getUniformLocation(program, 'kernelWeight');
                            var ker = gl.getUniformLocation(program, 'uKernel[0]');
                            gl.uniform1f(kernelWeight, kernels.edgeEnhancement.reduce((a, b) => a + b));
                            gl.uniform1fv(ker, kernels.edgeEnhancement);
                            break;
            case 'inverse' : gl.uniform1f(isInverse, 1.0); break;
        }
        gl.activeTexture(gl.TEXTURE0 + 1);
        gl.bindTexture(gl.TEXTURE_2D, paletteTex);

        gl.drawArrays(gl.TRIANGLES, 0, vertices.length/2);
        
        gl.activeTexture(gl.TEXTURE0 + 0);
        gl.bindTexture(gl.TEXTURE_2D, framebuffers[counter % 2].tex);
        counter++;
    }
    var v = getCoords();
    gl.uniform1f(flipY, -1.0);
    gl.viewport(0, 0, canvas.width, canvas.height);
    updateVertices(v.startX, v.startY, v.endX, v.endY);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    resetAll();
    gl.drawArrays(gl.TRIANGLES, 0, vertices.length/2);
};

grayscale.onclick = () => {
    applyImgPrc('grayscale');
};

inverse.onclick = () => {
    applyImgPrc('inverse');
};

palette.onclick = () => {
    applyImgPrc('palette');
};

kernel.onclick = () => {
    applyImgPrc('kernel');
};

reset.onclick = () => {
    filters = [];
    resetAll();
    applyImgPrc();
};