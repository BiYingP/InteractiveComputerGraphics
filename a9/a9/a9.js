"use strict";

var canvas;
var gl;
var program, colorProgram;

var face = [];
var normals = [];
var vertice = [];

var vBuffer;
var cBuffer;
var framebuffer, renderbuffer;

var uProjection;
var uModelView;
var projection;
var modelView;
var phi = 0.0;
var radius = 4.0;
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

var materialAmbient1 = [0.8, 0.2, 0.8, 1.0];
var materialDiffuse1 = [0.2, 0.8, 0.2, 1.0];
var materialSpecular1 = [0.8, 0.8, 0.8, 1.0];

var materialAmbient2 = [1.0, 0.0, 1.0, 1.0];
var materialDiffuse2 = [1.0, 0.8, 0.0, 1.0];
var materialSpecular2 = [1.0, 1.0, 1.0, 1.0];

var uAmbient, uDiffuse, uSpecular, uLight, uShininess;
var uNormal;
var normal;
var color = new Uint8Array(4);

window.onload = function init()
{
    canvas = document.getElementById("gl-canvas");

    gl = canvas.getContext('webgl2');
    if (!gl) alert("WebGL 2.0 isn't available");


    gl.viewport(0, 0, canvas.width, canvas.height);
    aspect =  canvas.width/canvas.height;
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.enable(gl.DEPTH_TEST);

    program = initShaders(gl, "phong-vertex-shader", "phong-fragment-shader");
    // vertex array attribute buffer
    vBuffer = gl.createBuffer();
    cBuffer = gl.createBuffer();
 
    canvas.addEventListener("mousedown", function(event){
        var texture = gl.createTexture();
        gl.bindTexture( gl.TEXTURE_2D, texture );
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 512, 512, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
        gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST );
        gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.generateMipmap(gl.TEXTURE_2D);

        framebuffer = gl.createFramebuffer();
        gl.bindFramebuffer( gl.FRAMEBUFFER, framebuffer);

        // Attach color buffer
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        var status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
        if(status != gl.FRAMEBUFFER_COMPLETE) alert('Frame Buffer Not Complete');

        sphere1();
        sphere2();
        sphere3();
     
        var x = event.clientX;
        var y = canvas.height-event.clientY;
                
        // create renderbuffer
        renderbuffer = gl.createRenderbuffer();
        gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffer);

        // allocate renderbuffer
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, 512, 512);  

        // attach renderebuffer
        gl.framebufferRenderbuffer(
              gl.FRAMEBUFFER,
              gl.DEPTH_ATTACHMENT,
              gl.RENDERBUFFER,
              renderbuffer
        );

        gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, color);
        console.log(color);
        
        // render to canvas
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);  
        gl.viewport(0, 0, canvas.width, canvas.height); 
        gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        
        materialDiffuse = [Math.random(), Math.random(), Math.random(), 1.0];
        materialDiffuse1 = [Math.random(), Math.random(), Math.random(), 1.0];
        materialDiffuse2 = [Math.random(), Math.random(), Math.random(), 1.0];
        
       // gl.drawElements(gl.TRIANGLES, face.length, gl.UNSIGNED_SHORT, 0);
      
    });

    document.onkeydown = function (event){
        if (event.keyCode == "79"){radius *= 1.1;}// press o key to increase camera radius
        if (event.keyCode == "80"){radius *=0.9;} // press p key to decrease camera radius
        if (event.keyCode == "81"){phi += dir;}// press q key to increase height
        if (event.keyCode == "87"){phi -= dir;} //press w key to decrease height
  
        if (event.keyCode == "88"){theta += dir;} //press 'x' key to rotate left
        if (event.keyCode == "67"){theta -= dir;}   // press 'c' key to rotate right
        if (event.keyCode == "27"){reset();}  // esc key to reset     
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
           
        };
        reader.readAsText(file);   
    }
    render();

}

function reset(){
    radius = 4.0;
    theta = 0.0;
    phi = 0.0;
}

var uTranslation;
function sphere1(){
     program = initShaders(gl, "phong-vertex-shader", "phong-fragment-shader");
     gl.useProgram(program);
 
    //color array atrribute buffer
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

     gl.uniform2f(gl.getUniformLocation(program, "uTranslation"), 1.0, 1.0);
     
     uModelView = gl.getUniformLocation(program, "uModelView");
     uProjection = gl.getUniformLocation(program, "uProjection");
     uNormal = gl.getUniformLocation(program, "uNormal");
     

     ambientProduct = mult(lightAmbient, materialAmbient1);
     diffuseProduct = mult(lightDiffuse, materialDiffuse1);
     specularProduct = mult(lightSpecular, materialSpecular1);

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
   
    gl.drawElements(gl.TRIANGLES, face.length, gl.UNSIGNED_SHORT, 0);
              
 }

function sphere2(){
    program = initShaders(gl, "phong-vertex-shader", "phong-fragment-shader");
    gl.useProgram(program);

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
    
    gl.uniform2f(gl.getUniformLocation(program, "uTranslation"), -1.0, -1.0);
//    gl.uniform2f(gl.getUniformLocation(program, "uScale"), 1.0, 1.0);
            
    uModelView = gl.getUniformLocation(program, "uModelView");
    uProjection = gl.getUniformLocation(program, "uProjection");
    uNormal = gl.getUniformLocation(program, "uNormal");
    
    
    ambientProduct = mult(lightAmbient, materialAmbient2);
    diffuseProduct = mult(lightDiffuse, materialDiffuse2);
    specularProduct = mult(lightSpecular, materialSpecular2);

    gl.uniform4fv(gl.getUniformLocation(program, "uAmbientProduct"),flatten(ambientProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "uDiffuseProduct"), flatten(diffuseProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "uSpecularProduct"), flatten(specularProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "uLightPosition"), flatten(lightPosition));
    gl.uniform1f(gl.getUniformLocation(program, "uShininess"), materialShininess);

    eye = vec3(radius*Math.sin(theta), radius*Math.sin(phi), radius*Math.cos(theta));   
    modelView = lookAt(eye, at , up);
    projection = perspective(fovy, aspect, near, far);  
    normal = normalMatrix(modelView, true);

    //gl.uniform2f(uTranslation, 0.0, -1.0);
    gl.uniformMatrix4fv(uModelView, false, flatten(modelView));
    gl.uniformMatrix4fv(uProjection, false, flatten(projection));
    gl.uniformMatrix3fv(uNormal, false, flatten(normal));

    gl.drawElements(gl.TRIANGLES, face.length, gl.UNSIGNED_SHORT, 0);
    
}
function sphere3(){
    program = initShaders(gl, "phong-vertex-shader", "phong-fragment-shader");
    gl.useProgram(program);

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
    
    gl.uniform2f(gl.getUniformLocation(program, "uTranslation"), 3.0, 3.0);
//    gl.uniform2f(gl.getUniformLocation(program, "uScale"), 1.0, 1.0);
            
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

    //gl.uniform2f(uTranslation, 0.0, -1.0);
    gl.uniformMatrix4fv(uModelView, false, flatten(modelView));
    gl.uniformMatrix4fv(uProjection, false, flatten(projection));
    gl.uniformMatrix3fv(uNormal, false, flatten(normal));

    gl.drawElements(gl.TRIANGLES, face.length, gl.UNSIGNED_SHORT, 0);
    
}
function render()
{   
    if (vertice.length != 0) {
        gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); 

        sphere1();
        sphere2();
        sphere3();
    }

    requestAnimationFrame(render);
}
