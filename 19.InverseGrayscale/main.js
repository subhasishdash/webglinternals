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
    gl_Position = vec4(position.x, position.y * -1.0, 0.0, 1.0);
    textureCoords = texCoords;
}
`;

var fragmentShader = `#version 300 es
precision mediump float;
in vec2 textureCoords;
uniform sampler2D uImage, uCode;
uniform float activeIndex;
out vec4 color;
uniform bool isGrayscale, isInverse;
void main() {
    vec4 tex1 = texture(uImage, textureCoords);
    if (isGrayscale) {
        float newPixelVal = tex1.r * 0.59 +  tex1.g * 0.30 +  tex1.b * 0.11;
        tex1 = vec4(vec3(newPixelVal), 1.0);
    } else if (isInverse) {
        tex1 = vec4(1.0 - tex1.rgb, 1.0);
    }
    color = tex1;
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

var texture;
var image = new Image();
var AR = null;
image.src = '../4KSample.jpg';
image.onload = () => {
    AR = utils.getAspectRatio(gl, image);
    var v = getCoords();
    vertices = utils.prepareRectVec2(v.startX, v.startY, v.endX, v.endY);
    buffer = utils.createAndBindBuffer(gl.ARRAY_BUFFER, gl.STATIC_DRAW, new Float32Array(vertices));
    texture = utils.createAndBindTexture(gl, image);
    render();
};
gl.useProgram(program);
var uImage = gl.getUniformLocation(program, 'uImage');
gl.uniform1i(uImage, 0);

var render = () => {
    //Step4
    utils.linkGPUAndCPU({program : program, buffer : buffer, dims : 2, gpuVariable : 'position'}, gl);
    utils.linkGPUAndCPU({program : program, buffer : texBuffer, dims : 2, gpuVariable : 'texCoords'}, gl);
    gl.activeTexture(gl.TEXTURE0 + 0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    //Step5
    gl.drawArrays(gl.TRIANGLES, 0, vertices.length/2);
};

var getDiff = (startX, startY, endX, endY) => {
    var obj = {
        startX : startX, startY : startY, endX : endX, endY
    };
    var v = utils.getGPUCoords(obj); //-1 to +1
    v = utils.getGPUCoords0To2(v); //0 to 2
    var diffX = v.endX - v.startX;
    var diffY = v.endY - v.startY;
    return {
        x : diffX, y : diffY
    };  
};

initializeEvents(gl, (startX, startY, endX, endY) => {
    var diff = getDiff(startX, startY, endX, endY);
    currSX += diff.x; currSY += diff.y;
    currEX += diff.x; currEY += diff.y;
    vertices = utils.prepareRectVec2(currSX, currSY, currEX, currEY);
    buffer = utils.createAndBindBuffer(gl.ARRAY_BUFFER, gl.STATIC_DRAW, new Float32Array(vertices));
    render();
    currSX = lastSX; currSY = lastSY; currEX = lastEX; currEY = lastEY;
}, (startX, startY, endX, endY) => {
    var diff = getDiff(startX, startY, endX, endY);
    lastSX += diff.x; lastSY += diff.y;
    lastEX += diff.x; lastEY += diff.y;
    currSX = lastSX; currSY = lastSY; currEX = lastEX; currEY = lastEY;
}, (deltaY) => {
    if (deltaY > 0) {
        //zoom out
        currSX -= currSX * 0.10; currEX -= currEX * 0.10; 
        currSY -= currSY * 0.10; currEY -= currEY * 0.10; 
    } else {
        //zoom in
        currSX += currSX * 0.10; currEX += currEX * 0.10; 
        currSY += currSY * 0.10; currEY += currEY * 0.10; 
    }
    vertices = utils.prepareRectVec2(currSX, currSY, currEX, currEY);
    buffer = utils.createAndBindBuffer(gl.ARRAY_BUFFER, gl.STATIC_DRAW, new Float32Array(vertices));
    render();
});



var grayscale = document.getElementById('grayscale');
var inverse = document.getElementById('inverse');
var reset = document.getElementById('reset');
var isGrayscale = gl.getUniformLocation(program, 'isGrayscale');
var isInverse = gl.getUniformLocation(program, 'isInverse');
grayscale.onclick = () => {
    var v1 = performance.now();
    gl.uniform1f(isInverse, 0.0);
    gl.uniform1f(isGrayscale, 1.0);
    render();
    var v2 = performance.now();
    console.log(v2 - v1);
};

inverse.onclick = () => {
    var v1 = performance.now();
    gl.uniform1f(isGrayscale, 0.0);
    gl.uniform1f(isInverse, 1.0);
    render();
    var v2 = performance.now();
    console.log(v2 - v1);
};

reset.onclick = () => {
    gl.uniform1f(isInverse, 0.0);
    gl.uniform1f(isGrayscale, 0.0);
    render();
};