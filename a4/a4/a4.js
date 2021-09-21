"use strict";

var canvas;
var gl;
var xAxis = 0;
var yAxis =1;
var zAxis = 2;
var uTheta;
var uTranslation;
var uScale;
var tDelta = 0.05;
var sDelta = 0.05;
var rDelta = 2.0;
var translate = [0, 0, 0];
var scale = [1, 1, 1];
var theta = [0, 0, 0];

var numElements = 36;

    var vertices = [
        vec3(-0.5, -0.5,  0.5),
        vec3(-0.5,  0.5,  0.5),
        vec3(0.5,  0.5,  0.5),
        vec3(0.5, -0.5,  0.5),
        vec3(-0.5, -0.5, -0.5),
        vec3(-0.5,  0.5, -0.5),
        vec3(0.5,  0.5, -0.5),
        vec3(0.5, -0.5, -0.5)
    ];

    var vertexColors = [
        [ 1.0, 0.0, 0.0, 1.0 ], // red
        [ 1.0, 0.0, 1.0, 1.0 ], // magenta
        [ 1.0, 1.0, 1.0, 1.0 ], // white
        [ 1.0, 1.0, 0.0, 1.0 ], // yellow
        [ 0.0, 0.0, 0.0, 1.0 ], // black
        [ 0.0, 0.0, 1.0, 1.0 ], // blue
        [ 0.0, 1.0, 1.0, 1.0 ], // cyan
        [ 0.0, 1.0, 0.0, 1.0 ] // green
    ];

// indices of the 12 triangles that compise the cube

var indices = [
    1, 0, 3,
    3, 2, 1,
    2, 3, 7,
    7, 6, 2,
    3, 0, 4,
    4, 7, 3,
    6, 5, 1,
    1, 2, 6,
    4, 5, 6,
    6, 7, 4,
    5, 4, 0,
    0, 1, 5
];

window.onload = function init()
{
    canvas = document.getElementById("gl-canvas");

    gl = canvas.getContext('webgl2');
    if (!gl) alert("WebGL 2.0 isn't available");


    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    gl.enable(gl.DEPTH_TEST);;

    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    // vertex array attribute buffer

    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation( program, "vPosition");
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition );
    
    // color array atrribute buffer

    var cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertexColors), gl.STATIC_DRAW);

    var vColor = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);

     // array element buffer
    
    var iBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(indices), gl.STATIC_DRAW);
    
    uTheta = gl.getUniformLocation(program, "uTheta");
    
    uTranslation = gl.getUniformLocation(program, "uTranslation");
    uScale = gl.getUniformLocation(program, "uScale");

    
    var menu = document.getElementById("transformation");
    menu.onchange = function () {
        //acquire the menu entry number
        var index = menu.selectedIndex;   
       //assign the value of the selected option.
       
        if (menu.options[index].value == "s"){
            scale[xAxis] -= 0.5;
            
        }
        if (menu.options[index].value == "r"){
            theta[xAxis] += rDelta;
            theta[yAxis] += rDelta;
        }
        if (menu.options[index].value == "t"){
            translate[xAxis] += tDelta;    
        }
             
    };
    
    document.onkeydown = function (event){
        if (event.keyCode == "79"){scale[xAxis] += sDelta;} // press o key to increase scale X
        if (event.keyCode == "80"){scale[xAxis] -= sDelta;}  // press p key to decrease scale x
        if (event.keyCode == "81"){scale[yAxis] += sDelta;}  // press q key to increase scale y
        if (event.keyCode == "87"){scale[yAxis] -= sDelta;}    //press w key to decrease scale y
  
        if (event.keyCode == "88"){theta[xAxis] += rDelta;}  //press 'x' key to increase rotation x
        if (event.keyCode == "67"){theta[xAxis] -= rDelta;} // press 'c' key to decrease rotation x
        if (event.keyCode == "89"){ theta[yAxis] += rDelta;}
        if (event.keyCode == "85"){theta[yAxis] -= rDelta;}
        if (event.keyCode == "90"){theta[zAxis] += rDelta;} // press 'z' key to increase rotation z
        if (event.keyCode == "65"){theta[zAxis] -= rDelta;}  // press 'a' key to decrease rotation z
        if (event.keyCode == "68"){translate[xAxis] += tDelta;} //press 'd' key to increase translation x
        if (event.keyCode == "70"){translate[xAxis] -= tDelta;}   //press 'f' key to decrease translation x
        if (event.keyCode == "72"){translate[yAxis] += tDelta;}   //press 'h' key to increase translation y
        if (event.keyCode == "74"){translate[yAxis] -= tDelta;}//press 'j' key to decrease translation y
        if (event.keyCode == "27"){
            // esc key to reset 
            reset();
        }
        
    };


    render();
}
function reset(){
    scale = [1, 1, 1];
    theta = [0, 0, 0];
    translate = [0, 0,0]; 
}

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.uniform3fv(uTheta, theta);
    gl.uniform3fv(uScale, scale);  
    gl.uniform3fv(uTranslation,translate);

    gl.drawElements(gl.TRIANGLES, numElements, gl.UNSIGNED_BYTE, 0);
    requestAnimationFrame(render);
}