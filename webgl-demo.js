import { initBuffers } from "./init-buffers.js";
import { drawScene } from "./draw-scene.js";
import { initShaderProgram } from "./shaders.js";
import { loadTexture } from "./textures.js";
import { calculate_new_center, transform, getFormData } from "./functions.js";
const vsSource = (await (await fetch("shaders/vertex.glsl"))    .text()).toString();
const fsSource = (await (await fetch("shaders/fragment.glsl"))  .text()).toString();

// Initialize the GL context IMPORTANT VERY IMPORTANT: SET CANVAS WIDTH BEFORE GETTING GL CONTEXT BECAUSE OTHWERISE IT BREAKS. thanks you :3
var canvas = document.querySelector("#glcanvas");

// Initialise some size variables
var width = window.innerWidth*2;
var height = window.innerHeight*2;
var canvas_size = height;

canvas.width = width;
canvas.height = height;

var gl = canvas.getContext("webgl", {antialias: true});
// Only continue if WebGL is available and working
if (gl === null) {
    alert(
        "Unable to initialize WebGL. Your browser or machine may not support it."
    );
}

// Add event listeners.
window.addEventListener("wheel", (event) => {
    // Stop regular zoom behaviour
    event.stopPropagation();
    event.preventDefault();

    // Calculate how much to zoom
    var zoom_modifier = 1.05;
    var zoom_amount = event.deltaY > 0 ? zoom_modifier : 1/zoom_modifier;

    var x = event.clientX*2;
    var y = height-event.clientY*2; //Invert the y co-ordinate because GLSL draws from bottom to top for some reason.

    center = calculate_new_center(center, size, [x, y], canvas_size, zoom_amount);
    size = size/zoom_amount;
    console.log("zooming in at size: " + size.toString());

    main();
}, {passive:false});

// Resize listener. Reload so the shader does not mess up.
window.addEventListener("resize",(event)=>{window.location.reload();});

// Form listener
var form = document.getElementById("ui");
var iterations;
function updateDataFromForm() {
    console.log('Form changed!');
    var formData = new FormData(form);
    var data = getFormData(formData);

    iterations = data["iterations"];
    if (iterations > 4096) {
        iterations = 4096;
    }

    var texture = data["color-scheme"]+".png";
    loadTexture(gl, "textures/"+texture, main); // This will run main() once the texture is loaded.
}
form.addEventListener("input", updateDataFromForm);

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
        canvas_size:   gl.getUniformLocation(shaderProgram, "canvas_size"),
        center:         gl.getUniformLocation(shaderProgram, "center"),
        tex:            gl.getUniformLocation(shaderProgram, "tex"),
        iter:            gl.getUniformLocation(shaderProgram, "iter")
    }
};

const buffers = initBuffers(gl);

var size = 3.0;
var center = [0, 0];
// Dummy-run the form event listener function so that we don't have to rewrite its behaviour here (getting iterations and color palette)
updateDataFromForm();

function main() {
    console.log('rendering...')
    // Draw the scene
    drawScene(gl, programInfo, buffers, size, canvas_size, center, iterations);
}