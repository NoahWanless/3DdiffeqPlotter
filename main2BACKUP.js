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

    //reneder
    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, (window.innerHeight - 100) );
    document.body.appendChild( renderer.domElement );

    //makes scene
    scene = new THREE.Scene();

    //axis 
    const axesHelper = new THREE.AxesHelper( 20 );
    //scene.add( axesHelper );

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
    //const axisPositions = new Float32Array(7); //one for center, other 6 are the end points of the axis
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

    expressionY = parser.parse("sin(y)");
    expressionX = parser.parse("sin(x)");
    expressionZ = parser.parse("sin(z)");

    //begins doing stuff
	updatePositions();
    renderer.render(scene, camera);
}



function eq(x1=0,y1=0,z1=0,t1=0){
    //expression.toJSFunction("x,y,z,t");
    //return (Math.sin(y1));
    let val = expressionY.evaluate({x:x1,y:y1,z:z1,t:t1});
    return val;
    //expression.jsFunction
}

function evaluatePoints(){
    terminal.log("EvaluatePoints has been called");
    const tempPositions = new Float32Array(MAX_POINTS*3);
    const position = line.geometry.attributes.position.array;
    //let positionAttribute = geometry.getAttribute('position');
    //terminal.log(geometry.hasAttribute('position'));
    //let posit = positionAttribute.array;
    //initialize everything to zero
	let x, y, z, index;
	x = y = z = index = 0;
    //for all the points randomly update them
    let runningTime = 0;
    let changingY = 5; //intial conditions
    let timeStep = 0.01
    
	for ( let i = 0, l = MAX_POINTS; i < l; i ++ ) { //here i would put eulers step 
        runningTime +=timeStep; //first update timestep
        changingY += expressionY.evaluate({x:0,y:changingY,z:0,t:runningTime}) * timeStep;
        //z = z+timeStep;

        position[ index ++ ] = runningTime; //x value
        position[ index ++ ] = changingY;
        position[ index ++ ] = z;
        
	}
    
    line.geometry.attributes.position.needsUpdate = true; //tells the gpu, hey the values you have are old and need to be replaced 
    
}





function updatePositions() {
    terminal.log("update postions has been called");
    //gets the postions array of the line object
	const positions = line.geometry.attributes.position.array;
    //initialize everything to zero
	let x, y, z, index;
	x = y = z = index = 0;
    //for all the points randomly update them
    let runningTime = 0;
    let changingY = 5; //intial conditions
    let timeStep = 0.01
    
	for ( let i = 0, l = MAX_POINTS; i < l; i ++ ) { //here i would put eulers step 
        runningTime +=timeStep; //first update timestep
        changingY += expressionY.evaluate({x:0,y:changingY,z:0,t:runningTime}) * timeStep;
        //z = z+timeStep;
        //changingY += eq(0,changingY,0,runningTime) * timeStep; //update out y,

        positions[ index ++ ] = runningTime;
        positions[ index ++ ] = changingY;
        positions[ index ++ ] = z;
	}
    
    
}


let iterationCounter = 10000
// animate
function animate() {
    requestAnimationFrame( animate );
    //if(drawCount < iterationCounter){
        //drawCount = ( drawCount + 1 ) % MAX_POINTS;  
    //}
    if(drawCount < MAX_POINTS){
        drawCount = ( drawCount + 1 );  
    }
    //terminal.log(drawCount);
	line.geometry.setDrawRange( 0, drawCount ); //this will increase the draw count as we go 
    //updatePositions(); //fpr the drawing
	renderer.render(scene, camera);
}

init();
let info1;
//^gets number of iterations on click 
document.getElementById("input1data").onclick = function(){
    info1 = document.getElementById("input1").value; 
    info1 = parseInt(info1);
    console.log(info1+1)
    document.getElementById("iterationdisplay").textContent = info1;
    iterationCounter = info1; //this makes it so the counter changes to the input of the button 
} //everything that happens on the button click 

//^gets eq from user
document.getElementById("inputforeqY").onclick = function(){
    let info2 = document.getElementById("input2foreqY").value; 
    document.getElementById("eqdisplayY").textContent = info2; //this version on display doesnt have all the potential vars x,y,z,t only those inputed by the user
    var expr = parser.parse(info2);
    expressionY = parser.parse(info2); 
        
}

//init();
//^starts animation
document.getElementById("input2start").onclick = function(){
    iterationCounter = 1000 //resets intial values so that if a new equation is used itll reset
    drawCount = 2
    terminal.log(expressionY.toString());
    evaluatePoints();
    animate();
}
//animate();
//terminal.log(info1);









   


