"use strict";

var canvas;
var gl;

var face = [];
var normals = [];
var vertice = [];
var position = [];

var vBuffer;
var cBuffer;

var uProjection;
var uModelView;
var projection;
var modelView;

var phi = 0.0;
var radius = 3.0;
var theta = 0.0;
var dir = 5.0 * Math.PI/180.0;

var eye;
const at = vec3(0.0, 0.0, 0.0);
const up = vec3(0.0, 1.0, 0.0);

var near = 1.0;
var far = -1.0;
var fovy = 45.0;
var aspect;
window.onload = function init()
{
    canvas = document.getElementById("gl-canvas");

    gl = canvas.getContext('webgl2');
    if (!gl) alert("WebGL 2.0 isn't available");


    gl.viewport(0, 0, canvas.width, canvas.height);
    aspect =  canvas.width/canvas.height;
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    gl.enable(gl.DEPTH_TEST);;

    //
    //  Load shaders and initialize attribute buffers
    //

    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    // vertex array attribute buffer
    vBuffer = gl.createBuffer();
    cBuffer = gl.createBuffer();
    
    var menu = document.getElementById("projection");
    menu.onchange = function () {
        //acquire the menu entry number
        var index = menu.selectedIndex;   
       //assign the value of the selected option.
       
        if (menu.options[index].value == "parellel"){
            fovy = 45.0; 
        }
        if (menu.options[index].value == "perspective"){
            fovy += 20.0;
        }
             
    };
    document.onkeydown = function (event){
        if (event.keyCode == "79"){
            // press o key to increase camera radius
            radius *= 1.1;   
        }
        if (event.keyCode == "80"){
            // press p key to decrease camera radius
            radius *=0.9;
          
        }
        if (event.keyCode == "81"){
            // press q key to increase height
           phi += dir;   
        }
        if (event.keyCode == "87"){
            //press w key to decrease height
           phi -= dir;
        } 
  
        if (event.keyCode == "88"){
            //press 'x' key to rotate left
            theta += dir;    
        }
        if (event.keyCode == "67"){
         // press 'c' key to rotate right
            theta -= dir;
        }
        if (event.keyCode == "27"){
            // esc key to reset 
            reset();
        }
        
    };
    
    document.getElementById('files').onchange = function(){
       
        var file = this.files[0];
        var reader = new FileReader();
        reader.onload = function(){
            position = [];
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
            
            for (var i = 0; i < face.length; i+=3){
                var p0 = vertice[face[i]];
                var p1 = vertice[face[i+1]];
                var p2 = vertice[face[i+2]];
                position.push(p0);
                position.push(p1);
                position.push(p2);
                // normalize the normal
                var n = cross(subtract(p1, p0), subtract(p2, p0));
                n = normalize(n);
                
                // take its absolute value,
                for (var j = 0; j < n.length; j++){
                    n[j] = Math.abs(n[j]);
                }
               // console.log(n);
                normals.push(n, n, n); 
                
            }
            

                gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
                gl.bufferData(gl.ARRAY_BUFFER, flatten(position), gl.STATIC_DRAW);

                var vPosition = gl.getAttribLocation( program, "vPosition");
                gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
                gl.enableVertexAttribArray(vPosition );

                // color array atrribute buffer

                gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
                gl.bufferData(gl.ARRAY_BUFFER, flatten(normals), gl.STATIC_DRAW);

                var vColor = gl.getAttribLocation(program, "vColor");
                gl.vertexAttribPointer(vColor, 3, gl.FLOAT, false, 0, 0);
                gl.enableVertexAttribArray(vColor);
            
                uModelView = gl.getUniformLocation(program, "uModelView");
                uProjection = gl.getUniformLocation(program, "uProjection");
              
           
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

function render()
{
    if (position.length != 0) {
        gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
          
        eye = vec3(radius*Math.sin(theta), radius*Math.sin(phi), radius*Math.cos(theta));
        modelView = lookAt(eye, at , up);
        projection = perspective(fovy, aspect, near, far);
        
        gl.uniformMatrix4fv(uModelView, false, flatten(modelView));
        gl.uniformMatrix4fv(uProjection, false, flatten(projection));

        gl.drawArrays(gl.TRIANGLES, 0, position.length);
    }

    requestAnimationFrame(render);
}