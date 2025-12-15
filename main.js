import * as THREE from 'three';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 500 );
//const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
//-for the prospective camera, the first number is the feild of view, a thing in degrees 
//-next is the aspect ratio, almost always the width divided by the height
//setting up the render
const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight ); //sets the renderer size, want to match that of the drowser 
document.body.appendChild( renderer.domElement );
//making and adding the cube
const geometry = new THREE.BoxGeometry( 1, 1, 1 );
const material =  new THREE.MeshBasicMaterial( { color: 0x0000ff } );
const cube = new THREE.Mesh( geometry, material );
scene.add(cube);
//adding a line
const lineMaterial = new THREE.LineBasicMaterial( { color: 0x0000ff } );
const points = []; //this list of points will define the vector
points.push( new THREE.Vector3( - 10, 0, 0 ) );
points.push( new THREE.Vector3( 0, 10, 0 ) );
points.push( new THREE.Vector3( 10, 0, 0 ) );

const lineGeometry = new THREE.BufferGeometry().setFromPoints( points );
const line = new THREE.Line( lineGeometry, lineMaterial );

scene.add( line );

camera.position.set( 0, 0, 100 );
camera.lookAt( 0, 0, 0 );


//camera.position.z = 3;
//camera.position.x = 1;



function animate() {
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    renderer.render( scene, camera );
    
    
  }
renderer.setAnimationLoop( animate );