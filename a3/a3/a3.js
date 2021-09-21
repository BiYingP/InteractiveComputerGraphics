
var gl;
var points;
var points1;
var points2;
var points3;
var points4;
var points5;
var direction = true;
var theta = 0;
var theta1 = 0;
var uTheta;
var uTheta1;
var speed = 50;
var program;
var vPosition;
var uPosition;
var uScale;
var colorName;
var uColor;
// The array for a mouse press
var penPoints = []; 
var colors = {
  'r': vec4(1, 0, 0, 1),
  'b': vec4(0, 0, 1, 1),
  'g': vec4(0, 1, 0, 1),
  'y': vec4(1, 1, 0, 1),
  'c': vec4(0, 1, 1, 1),
  'm': vec4(1, 0, 1, 1),
  'w': vec4(1, 1, 1, 1),
  'B': vec4(0, 0, 0, 1)
};
var ecllipseColor = colors['r'];;
var black = colors['B'];
var white = colors['w'];

window.onload = function init()
{
    var canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas, {preserveDrawingBuffer:true});
    if ( !gl ) { alert( "WebGL isn't available" ); }

    //  Configure WebGL
    gl.viewport( 0, 0, canvas.width, canvas.height );

    // Load the data into the GPU 
    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    
    document.getElementById( "rotation" ).onclick = function () {
        direction = !direction;
    
    };
  
    document.getElementById("slider").onchange = function(event) {
        speed = event.target.value;
        
    };
    
    var menu = document.getElementById("colorMenu");
    menu.onchange = function () {
        //acquire the menu entry number
        var index = menu.selectedIndex;   
       //assign the value of the selected option. 
        colorName = menu.options[index].value; 
        //change the object color 
        white = colors[colorName];     
    };
    
    document.onkeydown = function (event){
        if (event.keyCode == "66"){
           // alert("b key pressed");
            ecllipseColor = colors['b'];
        }
        if (event.keyCode == "82"){
           // alert("r key pressed");
            ecllipseColor = colors['r'];
        }
        if (event.keyCode == "71"){
           // alert("g key pressed");
            ecllipseColor = colors['g'];
        }
        if (event.keyCode == "89"){
           // alert("y key pressed");
            ecllipseColor = colors['y'];
        }
        if (event.keyCode == "80"){
           // alert("p key pressed");
            ecllipseColor = colors['m'];
        }
        if (event.keyCode == "87"){
           // alert("w key pressed");
            ecllipseColor = colors['w'];
        }
        
    }; 
    // register function /event handler 
    canvas.onmousedown = function (event) {
        // x coordinate of a mouse pointer
        var x = event.clientX;
        // y coordinate of a mouse pointer
        var y = event.clientY;  
        var rect = event.target.getBoundingClientRect();
        x = ((x - rect.left) - canvas.height/2)/(canvas.height/2); 
        y = (canvas.width/2 - (y - rect.top))/(canvas.width/2);

        // store the coordinates to points array 
        penPoints.push(x); 
        penPoints.push(y);
           
    };
        
    render();
}

function render() {
    gl.clearColor( 0.0, 0.0, 0.0, 1.0 );
    gl.clear(gl.COLOR_BUFFER_BIT);

    renderCircle();
    renderEllipse();
    renderTriangle(); 
    renderSquares();
    addPentangon();
    window.requestAnimationFrame(render);
}

function addPentangon(){
     var vertices = [
        vec2( -0.05, -0.05 ),
        vec2(-0.08, 0.05),
        vec2(0.0, 0.1),
        vec2(  0.08, 0.05 ),
        vec2( 0.05, -0.05 )    
    ];
  
    program = initShaders( gl, "vertex-shader4", "fragment-shader4" );
    gl.useProgram( program );
    
    // Load the data into the GPU
    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );
    
    vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray(vPosition);
    
    uPosition = gl.getUniformLocation( program, "uPosition");
    uColor = gl.getUniformLocation( program, "uColor");
    
    for (var i = 0; i < penPoints.length; i+=2) {
        // pass the position of a point to vPosition variable
        gl.uniform2f(uPosition, penPoints[i], penPoints[i+1]);
        gl.uniform4f(uColor, Math.random(), Math.random(), Math.random(), 1.0);

        gl.drawArrays(gl.TRIANGLE_FAN, 0, 5);     
    }
}

var circle= {x: 0.6, y: 0.7, r: 0.10};
var dir = 0.1;
function renderCircle(){
    
    dir += 0.01;
  
    var ATTRIBUTES = 2;
    var numFans = 32;
    var vertices = [circle.x, circle.y];

    for(var i = 0; i <= numFans; i++) {
      var index = ATTRIBUTES * i;
      var angle = ((2 * Math.PI) / numFans) * (i+1); // triangle fans
      vertices[index] = Math.cos(angle) * 0.1;
      vertices[index + 1] = Math.sin(angle) * 0.1;
        
    }
    
    var color = [];
    for (var i = 0; i <= vertices.length; i++){
        color[0] = vec4(0.0, 0.0, 0.0, 1.0);
        color[i] = vec4(1.0, 0.0, 0.0, 1.0);
    }

    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);
    
    vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray(vPosition);
         
    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(color), gl.STATIC_DRAW );
    
    var vColor = gl.getAttribLocation( program, "vColor");
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray( vColor );
    
    var uTranslation = gl.getUniformLocation(program, "uTranslation");
    gl.uniform2f(uTranslation, 0.6, 0.75);

    uScale = gl.getUniformLocation(program, "uScale");
    gl.uniform2f(uScale, Math.cos(speed * dir) + 1.0, Math.cos(speed * dir) + 1.0);
     
    gl.drawArrays(gl.TRIANGLE_FAN, 0, vertices.length/2);

}

function renderEllipse(){
        // Eclipe
    var ellipse = {x: -0.6, y: 1.2, r: 0.2};
    ATTRIBUTES = 2;
    numFans = 32;
    vertices = [ellipse.x, ellipse.y];
    
    for(i = 0; i <= numFans; i++) {
      index = ATTRIBUTES * i;
      angle = ((2 * Math.PI) / numFans) * (i+1); // triangle fans
      vertices[index] = ellipse.x + Math.cos(angle) * ellipse.r;
      vertices[index + 1] = ellipse.y + Math.sin(angle) * ellipse.r;
    }
        
    //  Load shaders and initialize attribute buffers
    program = initShaders( gl, "vertex-shader2", "fragment-shader2" );
    gl.useProgram( program );
    
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);
    
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition , 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
    
    var uScale = gl.getUniformLocation(program, "uScale");
    gl.uniform2f(uScale, 1.0, 0.6);
    
    uColor = gl.getUniformLocation( program, "uColor");
    gl.uniform4fv(uColor, ecllipseColor);
    
    gl.drawArrays(gl.TRIANGLE_FAN, 0, vertices.length/2);    
}

function renderTriangle() {
    
    var vertices = [       
        vec2( 0.0, 0.2 ),
        vec2( -0.25, -0.2),
        vec2( 0.25, -0.2)  
        ];
           
    var colors = [
        vec4( 1.0, 0.0, 0.0, 1.0 ),  // red
        vec4( 0.0, 1.0, 0.0, 1.0 ),  // green   
        vec4( 0.0, 0.0, 1.0, 1.0 ),  // blue           
        ];
    
    var program = initShaders( gl, "vertex-shader1", "fragment-shader1" );
    gl.useProgram( program );
    
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );
        
    // Associate out shader variables with our data buffer
    
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
               
    // Fragment buffer
    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );
    
    var vColor = gl.getAttribLocation( program, "vColor");
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray( vColor );
    
    var uTranslation = gl.getUniformLocation(program, "uTranslation");
    gl.uniform2f(uTranslation, 0.0, 0.7);
    
    uTheta = gl.getUniformLocation(program, "uTheta");
    theta += (direction ? -speed * 0.003 : speed * 0.003);
    
    gl.uniform1f(uTheta, theta);
    
    gl.drawArrays( gl.TRIANGLES, 0, 3 );

}

function renderSquares() {
    var vertices = [
        vec2( -0.05, -0.05 ),
        vec2( -0.05, 0.05 ),
        vec2( 0.05, 0.05 ),
        vec2(0.05, -0.05),
        
        vec2( -0.10, -0.10 ),
        vec2( -0.10, 0.10 ),
        vec2( 0.10, 0.10 ),
        vec2( 0.10, -0.10),
        
        vec2( -0.15, -0.15 ),
        vec2( -0.15, 0.15 ),
        vec2( 0.15, 0.15 ),
        vec2( 0.15, -0.15 ),
        
        vec2( -0.20, -0.20 ),
        vec2( -0.20, 0.20 ),
        vec2( 0.20, 0.20 ),
        vec2( 0.20, -0.20 ),
        
        vec2( -0.25, -0.25 ),
        vec2(  -0.25,  0.25 ),
        vec2(  0.25, 0.25 ),
        vec2( 0.25, -0.25 ),
        
        vec2( -0.30, -0.30 ),
        vec2( -0.30, 0.30 ),
        vec2( 0.30, 0.30 ),
        vec2( 0.30, -0.30),
        ];
    
    points = [vertices[0], vertices[1], vertices[2], vertices[3]];      
    points1 = [vertices[4], vertices[5], vertices[6], vertices[7]];
    points2 = [vertices[8], vertices[9], vertices[10], vertices[11]];
    points3 = [vertices[12], vertices[13], vertices[14], vertices[15]];
    points4 = [vertices[16], vertices[17], vertices[18], vertices[19]];
    points5 = [vertices[20], vertices[21], vertices[22], vertices[23]];

    var program = initShaders( gl, "vertex-shader3", "fragment-shader3" );
    gl.useProgram( program );
    
    
    uColor = gl.getUniformLocation( program, "uColor");
    uTheta1 = gl.getUniformLocation(program, "uTheta");
    theta1 += (direction ? speed * 0.003 : -speed * 0.003);
    gl.uniform1f(uTheta1, theta1);
    
    var uTranslation = gl.getUniformLocation(program, "uTranslation");
    gl.uniform2f(uTranslation, 0.0, -0.2);
         
    // white square
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points5), gl.STATIC_DRAW );
    
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    gl.uniform4fv(uColor, white);
    
    gl.drawArrays( gl.TRIANGLE_FAN, 0, points5.length);
     
    // black square
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points4), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    gl.uniform4fv(uColor, black);
   
    gl.drawArrays( gl.TRIANGLE_FAN, 0, points4.length);
    
    // white square
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points3), gl.STATIC_DRAW );
    
    vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    gl.uniform4fv(uColor, white);

    gl.drawArrays( gl.TRIANGLE_FAN, 0, points3.length);
    // black square
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points2), gl.STATIC_DRAW );

    // Associate out shader variables with our data buffer
    
    vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
 
    gl.uniform4fv(uColor, black);

    gl.drawArrays( gl.TRIANGLE_FAN, 0, points2.length);
    // white square
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points1), gl.STATIC_DRAW );

    // Associate out shader variables with our data buffer
    
    vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
    gl.uniform4fv(uColor, white);

    gl.drawArrays( gl.TRIANGLE_FAN, 0, points1.length);
    
    // black square
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    // Associate out shader variables with our data buffer  
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
    
    gl.uniform4fv(uColor, black);
    
    gl.drawArrays( gl.TRIANGLE_FAN, 0, points.length);
}






