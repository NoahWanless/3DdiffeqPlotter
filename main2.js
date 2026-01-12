import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { terminal } from 'virtual:terminal'


import ExprEval from 'expr-eval';
import { exp } from 'three/tsl';
const {Parser} = ExprEval;
let parser = new Parser();
let axisLength = 40;
let line;
const MAX_POINTS = 5000;
let drawCount;
let renderer, scene, camera;

let expressionY; //this is the math eq
let expressionX;
let expressionZ;


function init(){
    terminal.log('Hey terminal! A message from the browser via the init function')
    const canvasReference = document.getElementById("myCanvas");
    //reneder
    renderer = new THREE.WebGLRenderer({
        canvas: canvasReference,
        antialias: true // Optional: for smoother edges
    });
    renderer.setSize(canvasReference.clientWidth, canvasReference.clientHeight); //for the div size
    //renderer.setSize( window.innerWidth, (window.innerHeight - 100) ); //for the ful window
    renderer.setPixelRatio( window.devicePixelRatio );
    //document.body.appendChild( renderer.domElement ); //this directly adds the render to the html AT THE END

    //makes scene
    scene = new THREE.Scene();

    //camera
    camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 10000 );
    camera.position.set( 0, 0, 100 );

    // orbit control
    const controls = new OrbitControls( camera, renderer.domElement );
    controls.enabled = true;
    controls.target = new THREE.Vector3(0,0,0);
    controls.minDistance = 10;
    controls.maxDistance = 200;
    controls.enableDamping = false;
    controls.dampingFactor = 0.001;
    controls.autoRotate = false;
    controls.autoRotateSpeed = 1;
    controls.zoomSpeed = 1;

    //graph geometry 
    const geometry = new THREE.BufferGeometry();

    //attributes for graph geometry
    const positions = new Float32Array(MAX_POINTS*3);
    geometry.setAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );

    // limited drawcalls to actaully start the lines
	drawCount = 0; 
	geometry.setDrawRange( 0, drawCount )

    //axis 
    const axisMaterial = new THREE.LineBasicMaterial( { color: 0x00ffff } );
    const points = []; //this list of points will define the vectors
    points.push( new THREE.Vector3( 0, 0, 0 ) );
    points.push( new THREE.Vector3( 0, 0, axisLength ) );
    points.push( new THREE.Vector3( 0, 0, 0 ) );
    points.push( new THREE.Vector3( 0, axisLength, 0 ) );
    points.push( new THREE.Vector3( 0, 0, 0 ) );
    points.push( new THREE.Vector3( axisLength, 0, 0 ) );
    points.push( new THREE.Vector3( 0, 0, 0 ) );
    points.push( new THREE.Vector3( -axisLength, 0, 0 ) );
    points.push( new THREE.Vector3( 0, 0, 0 ) );
    points.push( new THREE.Vector3( 0, -axisLength, 0 ) );
    points.push( new THREE.Vector3( 0, 0, 0 ) );
    points.push( new THREE.Vector3( 0, 0, -axisLength ) );
    const axisGeometry = new THREE.BufferGeometry().setFromPoints( points );
    const axisLines = new THREE.Line( axisGeometry, axisMaterial );
    scene.add(axisLines);
    // line material
    const material = new THREE.LineBasicMaterial( { color: 0xff0000 } );

    //makes the graph line
    line = new THREE.Line( geometry,  material ); 
	scene.add( line );

    expressionY = parser.parse("x*(28-z)-y"); //preset eqauations
    expressionX = parser.parse("10*(y-x)");
    expressionZ = parser.parse("x*y-(8/3)*z");
    document.getElementById("eqdisplayY").textContent = "x*(28-z)-y";
    document.getElementById("eqdisplayX").textContent = "10*(y-x)";
    document.getElementById("eqdisplayZ").textContent = "x*y-(8/3)*z";

    //begins doing stuff
	//updatePositions();
    renderer.render(scene, camera);
    animate();
}

//evalutes the points of the line based on the eqs given
function evaluatePoints(){
    const position = line.geometry.attributes.position.array;
	let x, y, z, index;
	x = y = z = index = 0;
    let runningTime = 0;
    let changingY = 5; //intial conditions
    let changingX = 5; //intial conditions
    let changingZ = 5; //intial conditions
    let timeStep = 0.01 //!MAKE THIS BIGGER FOR DEMONSTRATION??????
    //this is using basic eulers method
	for ( let i = 0, l = MAX_POINTS; i < l; i ++ ) { //here i would put eulers step 
        runningTime +=timeStep; //first update timestep
        changingY += expressionY.evaluate({x:changingX,y:changingY,z:changingZ,t:runningTime}) * timeStep;
        changingX += expressionX.evaluate({x:changingX,y:changingY,z:changingZ,t:runningTime}) * timeStep;
        changingZ += expressionZ.evaluate({x:changingX,y:changingY,z:changingZ,t:runningTime}) * timeStep;
        position[ index ++ ] = changingX; //x value
        position[ index ++ ] = changingY;
        position[ index ++ ] = changingZ;
        
	}
    line.geometry.attributes.position.needsUpdate = true; //tells the gpu, hey the values you have are old and need to be replaced 
}





let iterationCounter = 10000
// animate
function animate() {
    requestAnimationFrame( animate );
    if(drawCount < iterationCounter){ //MAX_POINTS
        drawCount = ( drawCount + 1 );  
    }
	line.geometry.setDrawRange( 0, drawCount ); //this will increase the draw count as we go 
	renderer.render(scene, camera);
}



//^gets number of iterations on click 
document.getElementById("input1data").onclick = function(){
    let info1 = document.getElementById("input1").value; 
    info1 = parseInt(info1);
    console.log(info1+1)
    document.getElementById("iterationdisplay").textContent = info1;
    iterationCounter = info1; //this makes it so the counter changes to the input of the button 
} //everything that happens on the button click 

//^gets eq for Y from user
document.getElementById("inputforeqY").onclick = function(){
    let info2 = document.getElementById("input2foreqY").value; 
    document.getElementById("eqdisplayY").textContent = info2; //this version on display doesnt have all the potential vars x,y,z,t only those inputed by the user
    expressionY = parser.parse(info2); 
    terminal.log(expressionY.toString());    
        
}
//^gets eq for X from user
document.getElementById("inputforeqX").onclick = function(){
    let info20 = document.getElementById("input2foreqX").value; 
    document.getElementById("eqdisplayX").textContent = info20; //this version on display doesnt have all the potential vars x,y,z,t only those inputed by the user
    expressionX = parser.parse(info20); 
    terminal.log(expressionX.toString());    
        
}
//^gets eq for Z from user
document.getElementById("inputforeqZ").onclick = function(){
    let info200 = document.getElementById("input2foreqZ").value; 
    document.getElementById("eqdisplayZ").textContent = info200; //this version on display doesnt have all the potential vars x,y,z,t only those inputed by the user
    expressionZ = parser.parse(info200); 
    terminal.log(expressionZ.toString());    
}

//^starts animation
document.getElementById("input2start").onclick = function(){
    iterationCounter = 1000 //resets intial values so that if a new equation is used itll reset
    drawCount = 2
    terminal.log("animation time!");
    evaluatePoints();
    animate();
}

init();
//animate();
//terminal.log(info1);





//some cool strange attractors!
// https://www.dynamicmath.xyz/strange-attractors/




   


