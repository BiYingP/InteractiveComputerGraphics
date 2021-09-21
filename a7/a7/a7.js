"use strict";

var canvas;
var gl;
var program;
var position = [];
var normals = [];
var vBuffer;
var cBuffer;

var uProjection;
var uModelView;
var projection;
var modelView;
var uNormal, normal;

var phi = 0.0;
var radius = 20.0;
var theta = 0.0;
var dir = 5.0 * Math.PI/180.0;

var eye;
const at = vec3(0.0, 0.0, 0.0);
const up = vec3(0.0, 1.0, 0.0);

var near = 1.0;
var far = -1.0;
var fovy = 45.0;
var aspect;
var c = [
    vec3(0.0, 0.0, 0.0),
    vec3(2.0, 0.0, 1.5),
    vec3(4.0, 0.0, 2.9),
    vec3(6.0, 0.0, 0.0),
    vec3(0.0, 2.0, 1.1),
    vec3(2.0, 2.0, 3.9),
    vec3(4.0, 2.0, 3.1),
    vec3(6.0, 2.0, 0.7),
    vec3(0.0, 4.0, -0.5),
    vec3(2.0, 4.0, 2.6),
    vec3(4.0, 4.0, 2.4),
    vec3(6.0, 4.0, 0.4),
    vec3(0.0, 6.0, 0.3),
    vec3(2.0, 6.0, -1.1),
    vec3(4.0, 6.0, 1.3),
    vec3(6.0, 6.0, -0.2),
    
];

var c_x = mat4(0,2,4,6,0,2,4,6,0,2,4,6,0,2,4,6);
var c_y = mat4(0,0,0,0,2,2,2,2,4,4,4,4,6,6,6,6);
var c_z = mat4(0,1.5,2.9,0,1.1,3.9,3.1,0.7,-0.5,2.6,2.4,0.4,0.3,-1.1,1.3,-0.2);

var M = mat4(
    vec4(1, 0, 0, 0),
    vec4(-3, 3, 0, 0),
    vec4(3, -6, 3, 0),
    vec4(-1, 3, -3, 1),
);

var MT = mat4(
    vec4(1, -3, 3, -1),
    vec4(0, 3, -6, 3),
    vec4(0, 0, 3, -3),
    vec4(0, 0, 0, 1),
);

var lines = [
    0,0,0, 8,0,0,
    0,0,0, 0,8,0,
    0,0,0, 0,0,8
] 

var ambientProduct;
var diffuseProduct;
var specularProduct;

var lightPosition = vec4(1.0, 1.0, 1.0, 0.0);
var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0);
var lightDiffuse = vec4(0.6, 0.6, 0.6, 1.0);
var lightSpecular = vec4(1.0, 1.0, 1.0, 1.0);

var materialAmbient = vec4(0.6, 0.2, 0.2, 1.0);
var materialDiffuse = vec4(0.9, 0.1, 0.1, 1.0);
var materialSpecular = vec4(0.8, 0.8, 0.8, 1.0);
var materialShininess = 80.0;

var uAmbient, uDiffuse, uSpecular, uLight, uShininess;

window.onload = function init()
{
    canvas = document.getElementById("gl-canvas");

    gl = canvas.getContext('webgl2');
    if (!gl) alert("WebGL 2.0 isn't available");


    gl.viewport(0, 0, canvas.width, canvas.height);
    aspect =  canvas.width/canvas.height;
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    gl.enable(gl.DEPTH_TEST);
    //P(uSamples, vSamples);
    var menu = document.getElementById("projection");
    menu.onchange = function () {
        //acquire the menu entry number
        var index = menu.selectedIndex;   
       //assign the value of the selected option.
        if (menu.options[index].value == "parellel"){fovy = 45.0;}
        if (menu.options[index].value == "perspective"){fovy += 20.0;}
    };

    document.onkeydown = function (event){
        if (event.keyCode == "79"){radius *= 1.1;}// press o key to increase camera radius
        if (event.keyCode == "80"){radius *=0.9;} // press p key to decrease camera radius
        if (event.keyCode == "81"){phi += dir;}// press q key to increase height
        if (event.keyCode == "87"){phi -= dir;} //press w key to decrease height
  
        if (event.keyCode == "88"){theta += dir;} //press 'x' key to rotate left
        if (event.keyCode == "67"){theta -= dir;}   // press 'c' key to rotate right
        if (event.keyCode == "27"){reset();}  // esc key to reset 
        if (event.keyCode == "65"){uSamples+=1;} // a key to increase u
        if (event.keyCode == "83"){uSamples-=1;} // s key to decrease u
        if (event.keyCode == "75"){vSamples+=1;} // k key to increase v
        if (event.keyCode == "76"){vSamples-=1;} // l key to decrease v
        
    };
    render();

}

function reset(){
    radius = 20.0;
    theta = 0.0;
    phi = 0.0;
}

var points = [];
var triangle = [];
var uSamples = 10;
var vSamples = 10;

//function P(uSamples, vSamples){
for (var i = 0; i <= uSamples; ++i) {
    var row = [];
    
    for (var j = 0; j <= vSamples; ++j) {
        var u = 1.0/uSamples * i;
        var v = 1.0/vSamples * j;
        var U= vec4(1, u, u*u, u*u*u);
        var V = vec4(1, v, v*v, v*v*v);
        var X = dot(U, mult(M, mult(c_x, mult(MT, V))));
        var Y = dot(U, mult(M, mult(c_y, mult(MT, V))));
        var Z = dot(U, mult(M, mult(c_z, mult(MT, V))));
        row.push(vec3(X, Y, Z));
        } 
    points.push(row);  
    }


for (var i=0; i<points.length-1; i++){
    for (var j=0; j<points.length-1; j++){
        triangle.push(points[i][j], points[i+1][j], points[i+1][j+1]);
        triangle.push(points[i][j], points[i+1][j+1], points[i][j+1]);           
    }
}
for (var i=0; i<triangle.length; i+=3){
    var p0 = triangle[i];
    var p1 = triangle[i+1];
    var p2 = triangle[i+2];

        // normalize the normal
    var n = cross(subtract(p1, p0), subtract(p2, p0));
    n = normalize(n);
        
    for (var j = 0; j < n.length; j++){
        n[j] = Math.abs(n[j]);
    }
    normals.push(n,n,n);
}
//}
function renderLines(){
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    // vertex array attribute buffer
    vBuffer = gl.createBuffer();
    cBuffer = gl.createBuffer();
    
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(lines), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation( program, "vPosition");
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition );
    
    var vColor = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(vColor, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);
    
    uModelView = gl.getUniformLocation(program, "uModelView");
    uProjection = gl.getUniformLocation(program, "uProjection");
         
    eye = vec3(radius*Math.sin(theta), radius*Math.sin(phi), radius*Math.cos(theta));
    modelView = lookAt(eye, at , up);
    projection = perspective(fovy, aspect, near, far);
        
    gl.uniformMatrix4fv(uModelView, false, flatten(modelView));
    gl.uniformMatrix4fv(uProjection, false, flatten(projection));

    gl.drawArrays(gl.LINES, 0, 6);
    
}
function renderTriangles(){
    var program = initShaders(gl, "phong-vertex-shader", "phong-fragment-shader");
    gl.useProgram(program);
    
    // vertex array attribute buffer
    vBuffer = gl.createBuffer();
    cBuffer = gl.createBuffer();
   
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(triangle), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation( program, "vPosition");
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition );
    
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normals), gl.STATIC_DRAW);
    
    var vNormal = gl.getAttribLocation(program, "vNormal");
    gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vNormal);
        
    uModelView = gl.getUniformLocation(program, "uModelView");
    uProjection = gl.getUniformLocation(program, "uProjection");
    uNormal = gl.getUniformLocation(program, "uNormal");
    
    ambientProduct = mult(lightAmbient, materialAmbient);
    diffuseProduct = mult(lightDiffuse, materialDiffuse);
    specularProduct = mult(lightSpecular, materialSpecular);

    gl.uniform4fv(gl.getUniformLocation(program, "uAmbientProduct"),flatten(ambientProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "uDiffuseProduct"), flatten(diffuseProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "uSpecularProduct"), flatten(specularProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "uLightPosition"), flatten(lightPosition));
    gl.uniform1f(gl.getUniformLocation(program, "uShininess"), materialShininess);
    
    eye = vec3(radius*Math.sin(theta), radius*Math.sin(phi), radius*Math.cos(theta));
    modelView = lookAt(eye, at , up);
    projection = perspective(fovy, aspect, near, far);
    normal = normalMatrix(modelView, true);
      
    gl.uniformMatrix4fv(uModelView, false, flatten(modelView));
    gl.uniformMatrix4fv(uProjection, false, flatten(projection));
    gl.uniformMatrix3fv(uNormal, false, flatten(normal));
    gl.drawArrays(gl.TRIANGLES, 0, triangle.length);
}

function renderControlPoints(){
    var program = initShaders(gl, "c-vertex-shader", "c-fragment-shader");
    gl.useProgram(program);
    
    // vertex array attribute buffer
    vBuffer = gl.createBuffer();
    cBuffer = gl.createBuffer();
    
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(c), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation( program, "vPosition");
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
    
    uModelView = gl.getUniformLocation(program, "uModelView");
    uProjection = gl.getUniformLocation(program, "uProjection");
    
    eye = vec3(radius*Math.sin(theta), radius*Math.sin(phi), radius*Math.cos(theta));
    modelView = lookAt(eye, at , up);
    projection = perspective(fovy, aspect, near, far);
  
    gl.uniformMatrix4fv(uModelView, false, flatten(modelView));
    gl.uniformMatrix4fv(uProjection, false, flatten(projection));
  
    gl.drawArrays(gl.POINTS, 0, c.length);
}

function render()
{   
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    renderLines();
    renderControlPoints();
    renderTriangles();    

    requestAnimationFrame(render);
}