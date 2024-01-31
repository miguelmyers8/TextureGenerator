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
    this.clock = new THREE.Clock();
    //this.rend.scene_.add(this.player)
  }
  
  start() {
  }
  
  onWindowResize(vpW, vpH) {
    //this.rend.renderer.setSize(vpW, vpH);
  }

  update(t) {
    requestAnimationFrame(this.update.bind(this));
    this.rend.renderer.render(this.cm.rtt.rtScene,this.rend.camera_);
    nodeFrame.update();
  }
}
  
  var viewGL = new ViewGL();
  export default viewGL;