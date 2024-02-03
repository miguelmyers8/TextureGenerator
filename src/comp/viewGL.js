import * as NODE      from 'three/nodes';
import * as THREE     from 'three';
import renderer       from './render';
import { nodeFrame }  from 'three/addons/renderers/webgl-legacy/nodes/WebGLNodes.js';
import { FirstPersonControls }  from 'three/examples/jsm/controls/FirstPersonControls';
import {cubeMap } from './example/cubeMap';

class ViewGL {
  constructor() {
  }
  
  render(canvasViewPort) {
    this.rend = renderer;
    this.rend.WebGLRenderer(canvasViewPort);
    this.rend.scene();
    this.rend.camera();
    this.rend.updateCamera(0,0,7)
    this.rend.orbitControls()
    this.rend.renderer.setClearColor('white');
  }
  
  initViewPort(canvasViewPort) {
    this.canvasViewPort = canvasViewPort;
    this.render(this.canvasViewPort);

  }

  initQuad(){
  }

  initPlayer(){
    this.cm = cubeMap(this.rend.renderer)
    let scen = this.cm.rtt.rtScene
    this.scene = new THREE.Scene();

    this.clock = new THREE.Clock();
    //this.rend.scene_.add(this.player)
    let text = this.cm.textuerArray.map((canvas)=>{return new THREE.CanvasTexture(canvas)})
    //create shape
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    //const loader = new THREE.TextureLoader();
    const cubeMaterials = [
        new THREE.MeshBasicMaterial({ map: text[0]}), //right side
        new THREE.MeshBasicMaterial({ map: text[1]}), //left side
        new THREE.MeshBasicMaterial({ map: text[2]}), //top side
        new THREE.MeshBasicMaterial({ map: text[3]}), //bottom side
        new THREE.MeshBasicMaterial({ map: text[4]}), //front side
        new THREE.MeshBasicMaterial({ map: text[5]}), //back side
    ];

    //create material, color, or image texture
    let cube = new THREE.Mesh(geometry, cubeMaterials);
    this.scene.add(cube);

  }
  
  start() {
  }
  
  onWindowResize(vpW, vpH) {
    //this.rend.renderer.setSize(vpW, vpH);
  }

  update(t) {
    requestAnimationFrame(this.update.bind(this));
    this.rend.renderer.render(this.scene,this.rend.camera_);
    nodeFrame.update();
  }
}
  
  var viewGL = new ViewGL();
  export default viewGL;