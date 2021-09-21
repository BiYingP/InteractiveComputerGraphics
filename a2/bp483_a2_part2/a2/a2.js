
var gl;
var points;
var points1;
var points2;
var points3;
var points4;
var points5;

window.onload = function init()
{
    var canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
    
    //  Configure WebGL
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.0, 0.0, 0.0, 1.0 );
    gl.enable(gl.DEPTH_TEST);
    
    // Clear the canvas AND the depth buffer.
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);    
    
    
    renderCircle();
    renderEllipse();
    renderTriangle();   
    renderSquares();
    
}
function renderCircle(){
    // circle
    var circle = {x: 0.6, y: 0.7, r: 0.2};
    var ATTRIBUTES = 2;
    var numFans = 32;
    var vertices = [circle.x, circle.y];

    for(var i = 0; i <= numFans; i++) {
      var index = ATTRIBUTES * i;
      var angle = ((2 * Math.PI) / numFans) * (i+1); // triangle fans
      vertices[index] = circle.x + Math.cos(angle) * circle.r;
      vertices[index + 1] = circle.y + Math.sin(angle) * circle.r;
        
    }
    
    var color = [];
    for (var i = 0; i <= vertices.length; i++){
        color[0] = vec4(0.0, 0.0, 0.0, 1.0);
        color[i] = vec4(1.0, 0.0, 0.0, 1.0);
    }
    
    //  Load shaders and initialize attribute buffers
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    // Load the data into the GPU
    // vertices buffers
    var buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);
    
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
         
    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(color), gl.STATIC_DRAW );
    
    var vColor = gl.getAttribLocation( program, "vColor");
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray( vColor );
    
    var uScale = gl.getUniformLocation(program, "uScale");
    gl.uniform2f(uScale, 1.0, 1.0);

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
    var eclipeColor = [];
    for (var i = 0; i <= vertices.length; i++){
        eclipeColor[0] = vec4(1.0, 0.0, 1.0, 1.0);
        eclipeColor[i] = vec4(0.0, 1.0, 1.0, 1.0);
    }
        
    //  Load shaders and initialize attribute buffers
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    // Load the data into the GPU
    // vertices buffers
    var buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);
    
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition , 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
              
    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(eclipeColor), gl.STATIC_DRAW );
    
    var vColor = gl.getAttribLocation( program, "vColor");
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray( vColor );
    
    var uScale = gl.getUniformLocation(program, "uScale");
    gl.uniform2f(uScale, 1.0, 0.6);

    gl.drawArrays(gl.TRIANGLE_FAN, 0, vertices.length/2);
}

function renderTriangle() {
        
    var vertices = [       
        vec2( 0.0, 1.0 ),
        vec2( -0.25, 0.6),
        vec2( 0.25, 0.6),
        ];
           
    var colors = [
        vec4( 1.0, 0.0, 0.0, 1.0 ),  // red
        vec4( 0.0, 1.0, 0.0, 1.0 ),  // green   
        vec4( 0.0, 0.0, 1.0, 1.0 ),  // blue           
        ];
 
    
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
 
    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
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
    
    var uScale = gl.getUniformLocation(program, "uScale");
    gl.uniform2f(uScale, 1.0, 1.0);
   
    gl.drawArrays( gl.TRIANGLES, 0, 3 );
    
}

function renderSquares() {
    var vertices = [
        vec2( -0.08, -0.25 ),
        vec2( -0.08, -0.1 ),
        vec2( 0.08, -0.1 ),
        vec2(0.08, -0.25),
        
        vec2( -0.18, -0.35 ),
        vec2( -0.18, 0.0 ),
        vec2( 0.18, 0.0 ),
        vec2( 0.18, -0.35),
        
        vec2( -0.28, -0.45 ),
        vec2( -0.28, 0.1 ),
        vec2( 0.28, 0.1 ),
        vec2( 0.28, -0.45 ),
        
        vec2( -0.38, -0.55 ),
        vec2( -0.38, 0.2 ),
        vec2( 0.38, 0.2 ),
        vec2( 0.38, -0.55 ),
        
        vec2( -0.48, -0.65 ),
        vec2(  -0.48,  0.3 ),
        vec2(  0.48, 0.3 ),
        vec2( 0.48, -0.65 ),
        
        vec2( -0.58, -0.75 ),
        vec2( -0.58, 0.4 ),
        vec2( 0.58, 0.4 ),
        vec2( 0.58, -0.75),

        ];
    
    points = [vertices[0], vertices[1], vertices[2], vertices[3]];      
    points1 = [vertices[4], vertices[5], vertices[6], vertices[7]];
    points2 = [vertices[8], vertices[9], vertices[10], vertices[11]];
    points3 = [vertices[12], vertices[13], vertices[14], vertices[15]];
    points4 = [vertices[16], vertices[17], vertices[18], vertices[19]];
    points5 = [vertices[20], vertices[21], vertices[22], vertices[23]];
    
    var black = [];
    for(var i = 0; i <= 3; i++){
        black[0] = vec4(0.0, 1.0, 0.0, 1.0);
        black[i+1] = vec4(.0, 1.0, 1.0, 1.0);
    }

    var white = [];
    for(var j = 0; j <= 3; j++){
        white[0] = vec4(1.0, 0.0, 1.0, 1.0);
        white[j+1] = vec4(0.0, 0.0, 1.0, 1.0);
    }
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    // Load the data into the GPU
    
    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    
    // black square
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    // Associate out shader variables with our data buffer  
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
    
    // Fragment buffer
    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(black), gl.STATIC_DRAW );
    
    var vColor = gl.getAttribLocation( program, "vColor");
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray( vColor );
    
    var uScale = gl.getUniformLocation(program, "uScale");
    gl.uniform2f(uScale, 1.0, 1.0);

    gl.drawArrays( gl.TRIANGLE_FAN, 0, points.length);
    
    // white square
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points1), gl.STATIC_DRAW );

    // Associate out shader variables with our data buffer
    
    vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
    
    // Fragment buffer
    cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(white), gl.STATIC_DRAW );
    
    vColor = gl.getAttribLocation( program, "vColor");
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray( vColor );

    gl.drawArrays( gl.TRIANGLE_FAN, 0, points1.length);
    
    // black square
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points2), gl.STATIC_DRAW );

    // Associate out shader variables with our data buffer
    
    vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
    
    // Fragment buffer
    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(black), gl.STATIC_DRAW );
    
    var vColor = gl.getAttribLocation( program, "vColor");
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray( vColor );

    gl.drawArrays( gl.TRIANGLE_FAN, 0, points2.length);
    
    // white square
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points3), gl.STATIC_DRAW );
    
    vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
    
    // Fragment buffer
    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(white), gl.STATIC_DRAW );
    
    var vColor = gl.getAttribLocation( program, "vColor");
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray( vColor );

    gl.drawArrays( gl.TRIANGLE_FAN, 0, points3.length);
    
    // black square
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points4), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
    
    // Fragment buffer
    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(black), gl.STATIC_DRAW );
    
    var vColor = gl.getAttribLocation( program, "vColor");
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray( vColor );
    
    gl.drawArrays( gl.TRIANGLE_FAN, 0, points4.length);
     
    // white square
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points5), gl.STATIC_DRAW );
    
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
    
    // Fragment buffer
    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(white), gl.STATIC_DRAW );
    
    var vColor = gl.getAttribLocation( program, "vColor");
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray( vColor );
    
    gl.drawArrays( gl.TRIANGLE_FAN, 0, points5.length);

}




