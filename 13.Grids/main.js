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
in vec3 gridColor;
out vec3 gcolor;
void main() {
    gcolor = gridColor;
    gl_Position = vec4(position, 0.0, 1.0);
}`;
var fragmentShader = `#version 300 es
precision mediump float;
out vec4 color;
in vec3 gcolor;
void main () {
    color = vec4(gcolor, 1.0);
}`;
//Step 2 : 
var program = utils.getProgram(gl, vertexShader, fragmentShader);

var grids = document.getElementById('grids');
grids.oninput = (e) => {
    var input = Number(e.target.value);
    if (input >= 0) {
        console.log(e.target.value);
    } else {
        input = 0;
    }
    var startX = -1.0, startY = -1.0, endX = 1.0, endY = 1.0;
    var step = 2.0/input;
    endX = startX + step;
    endY = startY + step;

    var vertices = [], colors = [];
    var toggle = false;
    for (var i = 0; i < input; i++) {
        for (var j = 0; j < input; j++) {
            var vec2 = [startX, startY, endX, startY, startX, endY, 
                startX, endY, endX, endY, endX, startY];
            vertices = vertices.concat(vec2);
            startX = endX;
            endX += step;
            var white = [1.0, 1.0, 1.0];
            var black = [0.0, 0.0, 0.0];
            var color = toggle ? white : black;
            colors = colors.concat(color).concat(color).concat(color)
            .concat(color).concat(color).concat(color);
            toggle = !toggle;
        }
        if (input % 2 === 0) {
            toggle = !toggle;
        }
        startX = -1.0; startY = endY;
        endX = startX + step;
        endY = startY + step;
    }

    var data = new Float32Array(vertices);
    var colorData = new Float32Array(colors);
    var buffer = utils.createAndBindBuffer(gl.ARRAY_BUFFER, gl.STATIC_DRAW, data);
    var colorBuffer = utils.createAndBindBuffer(gl.ARRAY_BUFFER, gl.STATIC_DRAW, colorData);

    //Step4
    gl.useProgram(program);
    utils.linkGPUAndCPU({program : program, buffer : buffer, dims : 2, gpuVariable : 'position'}, gl);
    utils.linkGPUAndCPU({program : program, buffer : colorBuffer, dims : 3, gpuVariable : 'gridColor'}, gl);

    gl.drawArrays(gl.TRIANGLES, 0, vertices.length/2);

};















