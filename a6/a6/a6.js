"use strict";

var canvas;
var gl;
var program;

var face = [];
var normals = [];
var vertice = [];

var vBuffer;
var cBuffer;

var uProjection;
var uModelView;
var projection;
var modelView;
var phi = 0.0;
var radius = 3.0;
var theta = 0.0;
var eye;
var near = 1.0;
var far = -1.0;

const at = vec3(0.0, 0.0, 0.0);
const up = vec3(0.0, 1.0, 0.0);
var dir = 5.0 * Math.PI/180.0;

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
var materialShininess = 20.0;

var uAmbient, uDiffuse, uSpecular, uLight, uShininess;
var uNormal;
var normal;
var pProgram;
var gProgram;
var materials = 0.0;
window.onload = function init()
{
    canvas = document.getElementById("gl-canvas");

    gl = canvas.getContext('webgl2');
    if (!gl) alert("WebGL 2.0 isn't available");


    gl.viewport(0, 0, canvas.width, canvas.height);
    aspect =  canvas.width/canvas.height;
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.enable(gl.DEPTH_TEST);;
    
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
    
    var material = document.getElementById("material");
    material.onchange = function () {
        //acquire the menu entry number
        var index = material.selectedIndex;   
       //assign the value of the selected option.
        materials = material.options[index].value;
        switch (material.options[index].value){
            case ('1'):
                materialAmbient = [0.2, 0.2, 0.2, 0.0];
                materialDiffuse = [0.6, 0.8, 0.6, 0.0];
                materialSpecular = [0.8, 0.8, 0.8, 0.0];  
                break;

            case('2'):
                var green = {
                    'ambient': vec4(0.8, 0.2, 0.8, 1.0),
                    'diffuse': vec4(0.2, 0.8, 0.2, 1.0),
                    'specular': vec4(0.8, 0.8, 0.8, 1.0),
                    'shininess': 80.0,
                }
                materialAmbient = green.ambient;
                materialDiffuse = green.diffuse;
                materialSpecular = green.specular;
                materialShininess = green.shininess;
                break;
            
            case('3'): 

                     // yellow
                var yellow = {
                    'ambient': vec4(1.0, 0.0, 1.0, 1.0),
                    'diffuse': vec4(1.0, 0.8, 0.0, 1.0),
                    'specular': vec4(1.0, 1.0, 1.0, 1.0),
                    'shininess': 80.0,
                }
                materialAmbient = yellow.ambient;
                materialDiffuse = yellow.diffuse;
                materialSpecular = yellow.specular;
                materialShininess = yellow.shininess;
                break;
        }
     
             
    };
    var shading = document.getElementById("shading");
    shading.onchange = function () {
        //acquire the menu entry number
        var index = shading.selectedIndex;   
       //assign the value of the selected option.    
        if (shading.options[index].value == "gouraud"){ gouraud(); }
        if (shading.options[index].value == "phong"){ phong(); }        
    };
    document.getElementById('files').onchange = function(){
       
        var file = this.files[0];
        var reader = new FileReader();
        reader.onload = function(){
            normals = [];
            face = [];
            vertice = [];
            var lines = this.result.split('\n');
            for (var line = 0; line < lines.length; line++){
                //console.log(lines[line]);
                var strings = lines[line].trimRight().split(' ');
                switch(strings[0]){
                        case('v'):
                            vertice.push(new vec3(parseFloat(strings[1]), parseFloat(strings[2]), parseFloat(strings[3])));
                        break;
                        case 'f':
                          face.push(parseInt(strings[1])-1);
                          face.push(parseInt(strings[2])-1);
                          face.push(parseInt(strings[3])-1);
                        break;
                        
                }
            }
            
            for (var i = 0; i < vertice.length; i++) {
                normals.push(vec3(0.0));
            }
    
            for (var i = 0; i < face.length; i+=3){
                var p0 = vertice[face[i]];
                var p1 = vertice[face[i+1]];
                var p2 = vertice[face[i+2]];

                //normalize the normal
                var n = cross(subtract(p1, p0), subtract(p2, p0));
                normals[face[i]] = add(normals[face[i]], n);
                normals[face[i+1]] = add(normals[face[i+1]], n);
                normals[face[i+2]] = add(normals[face[i+2]], n);
            }        
            
            for (var i = 0; i < normals.length; ++i) {
                normals[i] = normalize(normals[i]);
            }

            //phong();
            gouraud();
           
        };
        reader.readAsText(file);   
    }
    render();

}

function reset(){
    radius = 3.0;
    theta = 0.0;
    phi = 0.0;
}


 function gouraud(){
     program = initShaders(gl, "g-vertex-shader", "g-fragment-shader");
     gl.useProgram(program);

     // vertex array attribute buffer
     vBuffer = gl.createBuffer();
     cBuffer = gl.createBuffer();  
             //     color array atrribute buffer
     gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
     gl.bufferData(gl.ARRAY_BUFFER, flatten(normals), gl.STATIC_DRAW);
            
     var vNormal = gl.getAttribLocation(program, "vNormal");
     gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, false, 0, 0);
     gl.enableVertexAttribArray(vNormal);
            
     gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
     gl.bufferData(gl.ARRAY_BUFFER, flatten(vertice), gl.STATIC_DRAW);

     var vPosition = gl.getAttribLocation( program, "vPosition");
     gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
     gl.enableVertexAttribArray(vPosition );   
    
     var iBuffer = gl.createBuffer();
     gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer);
     gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(face), gl.STATIC_DRAW);
            
     uModelView = gl.getUniformLocation(program, "uModelView");
     uProjection = gl.getUniformLocation(program, "uProjection");
     uNormal = gl.getUniformLocation(program, "uNormal");
              
 }

function phong(){
    program = initShaders(gl, "phong-vertex-shader", "phong-fragment-shader");
    gl.useProgram(program);

    // vertex array attribute buffer
    cBuffer = gl.createBuffer();  
    //     color array atrribute buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normals), gl.STATIC_DRAW);
            
    var vNormal = gl.getAttribLocation(program, "vNormal");
    gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vNormal);
            
    vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertice), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation( program, "vPosition");
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition );       
    
    var iBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(face), gl.STATIC_DRAW);
            
    uModelView = gl.getUniformLocation(program, "uModelView");
    uProjection = gl.getUniformLocation(program, "uProjection");
    uNormal = gl.getUniformLocation(program, "uNormal");
    
}
function render()
{   
    if (vertice.length != 0) {
        gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);   
        
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
        
        gl.uniform1f(gl.getUniformLocation(program, "material"), materials);

        //gl.drawArrays(gl.TRIANGLES, 0, position.length);
        gl.drawElements(gl.TRIANGLES, face.length, gl.UNSIGNED_SHORT, 0);
    }

    requestAnimationFrame(render);
}
