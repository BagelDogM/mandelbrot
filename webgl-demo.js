import { initBuffers } from "./init-buffers.js";
import { drawScene } from "./draw-scene.js";
import { initShaderProgram } from "./shaders.js";
import { loadTexture } from "./textures.js";
const vsSource = (await (await fetch("shaders/vertex.glsl"))    .text()).toString();
const fsSource = (await (await fetch("shaders/fragment.glsl"))  .text()).toString();

function transform(x, y, center, size) {
    var x_boundleft = center[0] - (size / 2.0);
    var x_boundright = center[0] + (size / 2.0);
    var y_boundleft = center[1] - (size/ 2.0);
    var y_boundright = center[1] + (size / 2.0);
    
    var xboundrange = (x_boundright - x_boundleft);
    var yboundrange = (y_boundright - y_boundleft);
    
    var xtransform = xboundrange / initial_size;
    var ytransform = yboundrange / initial_size;
    
    return [x * xtransform + x_boundleft, y * ytransform + y_boundleft];
}

// Initialize the GL context IMPORTANT VERY IMPORTANT: SET CANVAS WIDTH BEFORE GETTING GL CONTEXT BECAUSE OTHWERISE IT BREAKS. thanks you :3
var canvas = document.querySelector("#glcanvas");

var initial_size, width, height;

function setCanvasWidth() {
    console.log("resizing...")
    width = window.innerWidth*2;
    height = window.innerHeight*2;
    initial_size = height;
    canvas.width = width;
    canvas.height = height;
    console.log("height: " + (height).toString())
    console.log("width: " + (width).toString())
}
setCanvasWidth(); // Set the width and height etc for the first time.

var gl = canvas.getContext("webgl", {antialias: true});
// Only continue if WebGL is available and working
if (gl === null) {
    alert(
        "Unable to initialize WebGL. Your browser or machine may not support it."
    );
}

// Initialize the shader program.
const shaderProgram = initShaderProgram(gl, vsSource, fsSource);

// Collect all the info needed to use the shader program: attributes and uniform locations.
const programInfo = {
    program: shaderProgram,
    attribLocations: {
        vertexPosition: gl.getAttribLocation(shaderProgram, "aVertexPosition"),
    },
    uniformLocations: {
        size:           gl.getUniformLocation(shaderProgram, "size"),
        initial_size:   gl.getUniformLocation(shaderProgram, "initial_size"),
        center:         gl.getUniformLocation(shaderProgram, "center"),
        tex:            gl.getUniformLocation(shaderProgram, "tex"),
        iter:            gl.getUniformLocation(shaderProgram, "iter")
    }
};

const buffers = initBuffers(gl);

// Add event listeners.
window.addEventListener("wheel", (event) => {
    event.stopPropagation();
    event.preventDefault();
    var zoom_amount = 1.05;
    var zoom;
    if (event.deltaY > 0) {zoom = zoom_amount;}
    else if (event.deltaY < 0) {zoom = 1/zoom_amount;}
    else {zoom = 1;}

    var x = event.clientX*2;
    var y = event.clientY*2;

    // _m indicated mandelrbot co-ordinates. Invert the y co-ordinate because idfk why.
    var click_m = transform(x, height-y, center, size);

    // Get the distance from the click to the current center
    var xdist_m = center[0]-click_m[0];
    var ydist_m = center[1]-click_m[1];

    // modify it by the zoom
    xdist_m /= zoom;
    ydist_m /= zoom;

    // create a new center using the modified co-ords.
    center = [xdist_m+click_m[0], ydist_m+click_m[1]];
    size = size/zoom;
    console.log("zooming in at size: " + size.toString());

    main();
}, {passive:false});

// Resize listener
window.addEventListener("resize",(event)=>{window.location.reload();});

// Form listener
var form = document.getElementById("ui");

function getFormData(formData) {
    var entries = formData.entries();
    var data = Object.fromEntries(entries);
    return data;
}

form.addEventListener("input", function () {
    var formData = new FormData(form);
    var data = getFormData(formData);

    iterations = data["iterations"];
    if (iterations > 4096) {
        iterations = 4096;
    }

    texture = data["color-scheme"]+".png";
    loadTexture(gl, "textures/"+texture, main);
});

var formData = new FormData(form);

var size = 3.0;
var center = [0, 0];
var iterations = getFormData(formData)["iterations"];
var texture = "textures/"+getFormData(formData)["color-scheme"]+".png";
loadTexture(gl, texture, main);

function main() {
    console.log('rendering...')
    // Set clear color to black, fully opaque and then clear the color buffer with specified clear color
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
  
    // Draw the scene
    drawScene(gl, programInfo, buffers, size, initial_size, center, iterations);
}