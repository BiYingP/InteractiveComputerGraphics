"use strict";

var canvas;
var gl;
var program;
var position = [];
var normals = [];
var triangleNormals = [];
var vBuffer;
var cBuffer;
var uSampler;

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

var points = [];
var triangle = [];
var uSamples = 12;
var vSamples = 12;

function bezierSurface(uSamples, vSamples){
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
    
    for (var i = 0; i < points.length; i++) {
        var row = [];
        for( var j = 0; j < points[i].length; j++){
             row.push(vec3(0.0));
        }
        normals.push(row);
    }
    
    for (var i = 0; i < points.length-1; i++){
        for (var j = 0; j < points[i].length-1; j++) {
            var p0 = points[i][j];
            var p1 = points[i+1][j];
            var p2 = points[i+1][j+1];

            var n = cross(subtract(p1, p0), subtract(p2, p0));
            normals[i][j] = add(normals[i][j], n);
            normals[i+1][j] = add(normals[i+1][j], n);
            normals[i+1][j+1] = add(normals[i+1][j+1], n);
        }
    }
           
    for (var i = 0; i < normals.length-1; i++) {
        for (var j = 0; j < normals[i].length-1; j++){
            normals[i][j] = normalize(normals[i][j]);
        }      
    }
   // console.log(normals);
    for (var i=0; i<points.length-1; i++){
        for (var j=0; j<points.length-1; j++){
            triangleNormals.push(normals[i][j], normals[i+1][j], normals[i+1][j+1]);
            triangleNormals.push(normals[i][j], normals[i+1][j+1], normals[i][j+1]);           
        }
    }
   // console.log(triangleNormals);
}

//var img = new Image();
//img.addEventListener('load', render);
//img.crossOrigin = "";
//img.src = "https://i.imgur.com/ZKMnXce.png";

//var img = new Uint8Array([
//    255, 0, 0, 255,
//    255, 0, 0, 255,
//    0, 0, 255, 255,
//    0, 0, 255, 255,
//  ]);

//var img = new Uint8Array(4 * texSize * texSize);
//for ( var i = 0; i < texSize; i++ ) {
//    for ( var j = 0; j <texSize; j++ ) {
//        var x = Math.floor(i/(texSize/numChecks));
//        var y = Math.floor(j/(texSize/numChecks));
//        if (x/2 ^ y/2) c = 255;
//        else c = 0;
//      //  var c = 255*(((i & 0x8) == 0) ^ ((j & 0x8) == 0));
//        img[4 * i * texSize + 4* j] = c;
//        img[4 * i * texSize + 4 * j + 1] = Math.sin(0.1 *i);
//        img[4 * i * texSize + 4 * j + 2] = c;
//        img[4 * i * texSize + 4 * j + 3] = 255;
//    }
//}
var texSize = 64;
var numChecks = 12;
var c;
var checkerBoard = [];
var img = new Uint8Array( 4 * texSize * texSize );
for (var i = 0; i < texSize; i++) {
    checkerBoard[i] = [];
    for (var j = 0; j < texSize; j++) {
        checkerBoard[i][j] = [Math.sin(0.1 * i), c, Math.sin(0.1 * j), 1];
        for (var k = 0; k < 4; k++){
            img[4 * texSize * i + 4 * j + k] = 255 * checkerBoard[i][j][k];
        }     
    }
}

function initTexture(img) {
    var texture = gl.createTexture();
    gl.activeTexture( gl.TEXTURE0 );
    gl.bindTexture( gl.TEXTURE_2D, texture );
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, texSize, texSize, 0, gl.RGBA, gl.UNSIGNED_BYTE, img);
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);

    gl.uniform1i(uSampler, 0);
  
}

window.onload = function init()
{
    canvas = document.getElementById("gl-canvas");

    gl = canvas.getContext('webgl2');
    if (!gl) alert("WebGL 2.0 isn't available");


    gl.viewport(0, 0, canvas.width, canvas.height);
    aspect =  canvas.width/canvas.height;
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
    
    bezierSurface(uSamples, vSamples);
    
    var program = initShaders(gl, "phong-vertex-shader", "phong-fragment-shader");
    gl.useProgram(program);
    
    // vertex array attribute buffer
    vBuffer = gl.createBuffer();
    cBuffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(triangleNormals), gl.STATIC_DRAW);
    
    var vNormal = gl.getAttribLocation(program, "vNormal");
    gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vNormal);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(triangle), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation( program, "vPosition");
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition );

    var vTexCoord = gl.getAttribLocation( program, "vTexCoord" );
    gl.enableVertexAttribArray( vTexCoord );
    gl.vertexAttribPointer( vTexCoord, 3, gl.FLOAT, false, 0, 0 );
    
    uSampler = gl.getUniformLocation(program, "uSampler");
        
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
  
    initTexture(img);
    
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
        
    };
    render();

}

function reset(){
    radius = 20.0;
    theta = 0.0;
    phi = 0.0;
}

function render()
{   
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    eye = vec3(radius*Math.sin(theta), radius*Math.sin(phi), radius*Math.cos(theta));
    modelView = lookAt(eye, at , up);
    projection = perspective(fovy, aspect, near, far);
    normal = normalMatrix(modelView, true);
      
    gl.uniformMatrix4fv(uModelView, false, flatten(modelView));
    gl.uniformMatrix4fv(uProjection, false, flatten(projection));
    gl.uniformMatrix3fv(uNormal, false, flatten(normal));
    
    gl.drawArrays(gl.TRIANGLES, 0, triangle.length);

    requestAnimationFrame(render);
}