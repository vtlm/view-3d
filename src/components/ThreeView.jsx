import React, { Component } from "react";
import * as THREE from "three";
import OrbitControls from "orbit-controls-es6";
import GLTFLoader from "three-gltf-loader";

import { Tree } from "antd";
import "antd/dist/antd.css";

import { observable, toJS } from "mobx";
import { observer } from "mobx-react";

import { appState, floatHintState, spaState, spaStateObj } from "./AppState";

// import DataView from "./DataView";
// import Float from "./FloatHint";
import FormDialog, { styles } from "./FormDialog";
import NestedList from "./NestedList";
// import MobxTst from "./MobxTst";

import FloatHint from "./FloatHint";

import db,{client} from "../db";

const TreeNode = Tree.TreeNode;

var INTERSECTED;
var ptNumb = 1;

class ThreeCanvas {
  constructor(renderer, box) {
    // this.renderer
    // this.obsts = []
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.mouseR = new THREE.Vector2();
    this.tVect = new THREE.Vector3();
    this.cLength = 0;
    this.mapViewMode = true;
    this.markNode = null;
  }

  createCube = (pos = new THREE.Vector3(), material) => {
    var geometry = new THREE.BoxGeometry(1, 1, 1);
    var cube = new THREE.Mesh(geometry, material);
    cube.position.copy(pos);
    //this.scene.add(cube)

    let dir = new THREE.Vector3(0, 2, 0);

    //normalize the direction vector (convert to vector of length 1)
    dir.normalize();

    let origin = new THREE.Vector3(0, 0, 0);
    let length = 5;
    let hex = 0xff0000;

    let arrowHelper = new THREE.ArrowHelper(dir, origin, length, hex);
    arrowHelper.name = "speedArrow";
    // console.log(arrowHelper)
    cube.add(arrowHelper);
    // console.log(cube.getObjectByName('speedArrow'))
    return cube;
  };

  createPlane = parms => {
    // console.log('pparms',parms)
    let geometry = new THREE.PlaneGeometry(parms.size.width, parms.size.length);
    let material = new THREE.MeshBasicMaterial({
      color: parms.color,
      transparent: true,
      opacity: 0.4
    });
    let plane = new THREE.Mesh(geometry, material);
    //plane.position.z = parms.size.length / 2
    plane.position.y = parms.heightShift;
    plane.rotation.x = -Math.PI / 2;
    return plane;
  };

  init = mountId => {
    this.el = document.getElementById(mountId);
    console.log("divSize", this.el.clientWidth, this.el.clientHeight, mountId);

    let scene = new THREE.Scene();
    this.scene = scene;
    // this.scene.background = new THREE.Color(0xff5555)
    this.oNode = new THREE.Object3D();
    scene.add(this.oNode);
    this.targetNode = new THREE.Object3D();
    scene.add(this.targetNode);
    // this.markNode = new THREE.Object3D()
    // scene.add(this.markNode)
    this.editNode = new THREE.Object3D();
    scene.add(this.editNode);

    let gridHelper = new THREE.GridHelper(200, 20);
    this.scene.add(gridHelper);

    // var boxHelper = new THREE.BoxHelper()
    // scene.add(boxHelper)

    let camAspect = this.el.clientWidth / (this.el.clientHeight / 1);
    // console.log()

    let camera = new THREE.PerspectiveCamera(
      75,
      // window.innerWidth / (window.innerHeight / 1),
      camAspect,
      0.1,
      1000
    );
    this.camera = camera;
    // var camera = new THREE.OrthographicCamera( 75, window.innerWidth/(window.innerHeight/1), 0.1, 1000 );
    // var	camera = new THREE.CombinedCamera( window.innerWidth / 2, window.innerHeight / 2, 70, 1, 1000, - 500, 1000 );

    this.renderer = new THREE.WebGLRenderer({ alpha: true });
    // this.renderer.setSize(window.innerWidth, window.innerHeight / 1)
    this.renderer.setSize(this.el.clientWidth, this.el.clientHeight / 1);
    // var clock = new THREE.Clock()

    this.el.appendChild(this.renderer.domElement);

    let geometry = new THREE.SphereGeometry(1, 16, 16);
    let material = new THREE.MeshBasicMaterial({
      color: 0xff8800,
      transparent: true,
      opacity: 0.7
    });
    // material.wireframe=true
    this.cube = new THREE.Mesh(geometry, material);
    this.cube.position.z = 20;
    scene.add(this.cube);
    this.arrowHelper = new THREE.ArrowHelper(
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 1, 0),
      10,
      0xff0000
    );
    scene.add(this.arrowHelper);
    //
    // this.box = cube

    geometry = new THREE.CylinderGeometry(2, 4, 30, 28, 10);

    // material
    material = new THREE.MeshPhongMaterial({
      color: 0xaaaaaa,
      shading: THREE.FlatShading,
      polygonOffset: true,
      polygonOffsetFactor: 1, // positive value pushes polygon further away
      polygonOffsetUnits: 1
    });

    // mesh
    var mesh = new THREE.Mesh(geometry, material);
    // this.targetNode.add( mesh );

    // wireframe - old way
    /*
      var helper = new THREE.EdgesHelper( mesh, 0xffffff );
      //var helper = new THREE.WireframeHelper( mesh, 0xffffff ); // alternate
      helper.material.linewidth = 2;
      scene.add( helper );
      */

    // wireframe - new way
    var geo = new THREE.EdgesGeometry(mesh.geometry); // or WireframeGeometry
    var mat = new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 1 });
    var wireframe = new THREE.LineSegments(geo, mat);
    mesh.add(wireframe);

    mesh.position.y = 15;

    // material = new THREE.MeshBasicMaterial( {color: 0xffff00} );
    // var cylinder = new THREE.Mesh( geometry, material );
    // cylinder.position.y=10
    // scene.add( cylinder );

    camera.position.z = -45;
    camera.position.y = 25;

    let light = new THREE.HemisphereLight(0xffffbb, 0x080820, 1);
    scene.add(light);

    const controls = new OrbitControls(camera, this.renderer.domElement);
    controls.enabled = true;
    controls.maxDistance = 1500;
    controls.minDistance = 0;

    // LIGHTS
    let hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.65);
    hemiLight.color.setHSL(0.6, 1, 0.6);
    hemiLight.groundColor.setHSL(0.095, 1, 0.75);
    hemiLight.position.set(110, 500, 110);
    scene.add(hemiLight);

    let dirLight = new THREE.DirectionalLight(0xffffff, 0.41);
    dirLight.color.setHSL(0.1, 1, 0.95);
    dirLight.position.set(-1, 1.75, 1);
    dirLight.position.multiplyScalar(450);
    scene.add(dirLight);

    // console.log('areas', parms.areas)
    // Object.values(parms.areas).forEach(x =>
    //   this.scene.add(this.createPlane(x))
    // );

    this.materialBlue = new THREE.MeshBasicMaterial({
      color: 0x0000ff,
      wireframe: true
    });
    let materialGreen = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    materialGreen.wireframe = true;
    let materialRed = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    materialRed.wireframe = true;
    this.materialGreen = materialGreen;
    this.materialRed = materialRed;

    this.divElem = document.createElement("div");
    // this.divElem.style.position = 'relative' //'absolute'
    this.divElem.style.position = "absolute";
    this.divElem.style.zIndex = 3;
    // divElem.style.color = 'white';
    this.divElem.innerHTML = "text"; //+ i;
    // this.el.appendChild(this.divElem)

    this.divElemMark = document.createElement("div");
    this.divElemMark.style.position = "absolute";
    this.divElemMark.style.zIndex = 3;
    // divElem.style.color = 'white';
    this.divElemMark.innerHTML = "text"; //+ i;
    this.el.appendChild(this.divElemMark);

    // Instantiate a loader
    const loader = new GLTFLoader();
    // Optional: Provide a DRACOLoader instance to decode compressed mesh data
    // THREE.DRACOLoader.setDecoderPath( '/examples/js/libs/draco' );
    // loader.setDRACOLoader( new THREE.DRACOLoader() );

    // Load a glTF resource
    loader.load(
      // resource URL
      "Girder_XBox.gltf",
      // called when the resource is loaded
      gltf => {
        // this.targetNode.add( gltf.scene );

        gltf.scene.children
          // .filter(x => x.type == 'Mesh')
          .filter(x => x.name.includes("Girder"))
          .forEach((x, i) => {
            appState.objects.push(x.name);
            spaStateObj.objects.push(x.name);
            appState.points[x.name] = [];
            this.targetNode.add(x);
            // let divElem = document.createElement('div')
            // divElem.style.position = 'absolute'
            // // // divElem.style.zIndex = 3
            // // // divElem.style.color = 'white';
            // divElem.innerHTML = 'object_' + i
            // x.userData = divElem
            // this.el.appendChild(divElem)
          });

        gltf.scene.children
          .filter(x => x.name.includes("Mesh"))
          .forEach((x, i) => {
            this.oNode.add(x);
            // let divElem = document.createElement('div')
            // divElem.style.position = 'absolute'
            // // // divElem.style.zIndex = 3
            // // // divElem.style.color = 'white';
            // divElem.innerHTML = 'object_' + i
            // x.userData = divElem
            // this.el.appendChild(divElem)
          });

        // console.log('gltf',gltf,this.targetNode)

        db.collection("comments")
          .find({ type: "point" }, { limit: 1000 })
          .asArray()
          .then(docs => {
            console.log("docs", docs);
            appState.pts = docs;
            spaState.pts = docs;
            spaStateObj.pts = docs;
            docs.forEach(x => {
              if (x.parent) {
                console.log(x.parent, x.pos);

                let geometry = new THREE.SphereGeometry(1, 16, 16);
                let material = new THREE.MeshBasicMaterial({
                  color: 0xff0000,
                  transparent: true,
                  opacity: 0.4
                });
                // material.wireframe=true
                let cube = new THREE.Mesh(geometry, material);
                cube.name = "Point_" + ptNumb;
                ptNumb += 1;
                let parentObj = this.scene.getObjectByName(x.parent);
                if (parentObj) {
                  let markNode = new THREE.Object3D();
                  parentObj.add(markNode);
                  markNode.add(cube);
                  cube.position.set(x.pos.x, x.pos.y, x.pos.z);
                  // console.log('click!', this.intersects[0].point, cube.position)
                  // appState.points[appState.selectedObject].push(cube.name)
                }
              }
            });
          });
      },
      // called while loading is progressing
      function(xhr) {
        console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
      },
      // called when loading has errors
      function(error) {
        console.log("An error happened");
      }
    );

    // this.projector=new THREE.Projector()
    this.pt3d = new THREE.Vector3();
    this.pt2d = null;

    this.scene.add(this.ArrowHelper);

    // const animate = () => {
    //   if (enableAnim) requestAnimationFrame(animate);

    //   for (let i = 0; i < this.oNode.children.length; i++) {
    //     // this.oNode.children[i].position.y += 0.5-Math.random()
    //     this.oNode.children[i].visible = Math.random() > 0.5 ? true : false;
    //   }

    //   render();
    // };

    // const render = () => {
    //   var delta = clock.getDelta();

    //   if (mixer !== undefined) {
    //     mixer.update(delta);
    //   }

    //   this.renderer.render(this.scene, camera);
    // };

    const animate2 = () => {
      if (this.mapViewMode) {
        // this.updateLabels(this.targetNode)

        this.raycaster.setFromCamera(this.mouse, this.camera);

        // this.targetNode.children.forEach(x=>{
        //   // console.log(x)
        //   this.intersects = this.raycaster.intersectObjects(x.children)
        //   if(this.intersects.length){
        //   this.cube.visible = true
        //   this.arrowHelper.visible = true
        //
        //   this.cube.position.copy(this.intersects[0].point)
        //   this.arrowHelper.position.copy(this.intersects[0].point)
        //   this.arrowHelper.setDirection(this.intersects[0].face.normal)
        // }
        // })

        // calculate objects intersecting the picking ray
        this.intersects = this.raycaster.intersectObjects(
          this.targetNode.children,
          true
        );
        // console.log(this.intersects.length)
        // this.intersects.length=[]
        if (this.intersects.length > 0) {
          if (INTERSECTED != this.intersects[0].object) {
            if (INTERSECTED)
              INTERSECTED.material.color.setHex(INTERSECTED.currentHex);
            INTERSECTED = this.intersects[0].object;
            INTERSECTED.currentHex = INTERSECTED.material.color.getHex();
            if (INTERSECTED.name.includes("Point")) {
              // console.log('Point')
              INTERSECTED.material.color.setHex(0xffff00);
              floatHintState.visible = true;
              floatHintState.left = this.mouseR.x + "px";
              floatHintState.top = this.mouseR.y + "px";

              // this.divElemMark.style.left = this.mouseR.x + "px";
              // this.divElemMark.style.top = this.mouseR.y + "px";
              // console.log(this.divElemMark)
              // this.divElemMark.style.visibility = "visible";cd
              let pt = appState.pts.find(
                x => x.pos.x == INTERSECTED.position.x
              );
              appState.pt = pt;
              appState.mark = pt;
              console.log(
                "sel mark", // appState.mark, pt,
                INTERSECTED
              );
              // let str = pt.name ? pt.name : "noName";
              // str += "<br>";
              // str += pt.level ? pt.level : "noLevel";
              // str += "<br>";
              // str += pt.descr ? pt.descr : "noDescr";
              // this.divElemMark.innerHTML = str;
              //console.log('pt=',pt)
            } else {
              // this.divElemMark.style.visibility = "hidden";
              INTERSECTED.material.color.setHex(0xff0000);
              appState.selectedObject = INTERSECTED.name;
              floatHintState.visible = false;
            }
            // console.log(this.intersects)
            // console.log(this.intersects[0].point,this.intersects[0].object)
            // appState.objects.push('ddd')
          }
        } else {
          if (INTERSECTED)
            INTERSECTED.material.color.setHex(INTERSECTED.currentHex);
          INTERSECTED = null;
          appState.selectedObject = "";
          this.divElemMark.style.visibility = "hidden";
          floatHintState.visible = false;
        }
      } else {
        this.raycaster.setFromCamera(this.mouse, this.camera);

        // calculate objects intersecting the picking ray
        this.intersects = this.raycaster.intersectObjects(
          this.editNode.children
        );

        if (this.intersects.length > 0) {
          // if (INTERSECTED != this.intersects[0].object) {
          //   if (INTERSECTED)
          //     INTERSECTED.material.color.setHex(INTERSECTED.currentHex)
          //   INTERSECTED = this.intersects[0].object
          //   INTERSECTED.currentHex = INTERSECTED.material.color.getHex()
          //   INTERSECTED.material.color.setHex(0xff0000)
          // console.log(this.intersects)
          //   // console.log(this.intersects[0].point)
          // }
          this.cube.visible = true;
          this.arrowHelper.visible = true;

          this.cube.position.copy(this.intersects[0].point);
          this.arrowHelper.position.copy(this.intersects[0].point);
          this.arrowHelper.setDirection(this.intersects[0].face.normal);
        } else {
          if (INTERSECTED)
            INTERSECTED.material.color.setHex(INTERSECTED.currentHex);
          INTERSECTED = null;

          this.cube.visible = false;
          this.arrowHelper.visible = false;
        }
      }

      // console.log(this.scene.children)
      // update the picking ray with the camera and mouse position

      this.renderer.render(this.scene, camera);

      requestAnimationFrame(animate2);
    };

    // init_3()
    // animate()
    // render()

    // window.addEventListener('mousemove', this.onMouseMove, false)
    this.el.addEventListener("mousemove", this.onMouseMove, false);
    window.addEventListener("resize", this.onWindowResize, false);
    document.addEventListener("mousedown", this.onDocumentMouseDown, false);
    document.addEventListener("keydown", this.onDocumentKeyDown, false);
    animate2();
  };

  updateLabels = node => {
    // console.log(node)

    node.children.forEach(x => {
      if (x.visible) {
        this.divElem = x.userData;
        // this.divElem.style.visibility=this.oNode.children[i + indOffs].visible?'visible':'hidden'
        this.pt3d.copy(x.position);
        this.pt2d = this.pt3d.project(this.camera);
        this.pt2d.x = ((this.pt2d.x + 1) / 2) * this.el.clientWidth;
        let x1 = (this.pt2d.x + 1) / 2; // * this.el.clientWidth;
        this.pt2d.y = (-(this.pt2d.y - 1) / 2) * this.el.clientHeight;
        this.divElem.style.left = this.pt2d.x + "px";
        this.divElem.style.top = this.pt2d.y + "px";
        this.divElem.innerHTML =
          this.pt2d.x.toFixed(2) + " " + this.pt2d.y.toFixed(2);
      } else {
        x.userData.style.visibility = "hidden";
      }
    });
  };

  onMouseMove = event => {
    // calculate mouse position in normalized device coordinates
    // (-1 to +1) for both components
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    this.mouseR.x = event.clientX;
    this.mouseR.y = event.clientY;
    // console.log(this.mouse)
  };

  onWindowResize = () => {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(this.el.clientWidth, this.el.clientHeight / 1);
  };

  onDocumentMouseDown = () => {
    if (this.mapViewMode) {
      if (!appState.mouseInPanel && this.intersects.length) {
        if (INTERSECTED.name.includes("Point_")) {
          // console.log(INTERSECTED)
          // return
          appState.open = true;
          // appState.mark=toJS(appState.pt)
          // console.log('pt',toJS(appState.pt))
          this.currObj = this.intersects[0].object;
        } else {
          // displayComments();
          // this.targetNode.visible=false
          appState.mark={}
          this.scene.remove(this.targetNode);
          this.scene.remove(this.oNode);
          this.mapViewMode = false;
          this.currObj = this.intersects[0].object;
          this.editObj = this.intersects[0].object.clone();
          // this.editObj.position.copy(new THREE.Vector3())
          this.editObj.position.x = 0;
          this.editObj.position.z = 0;
          this.markNode = new THREE.Object3D();
          this.editObj.add(this.markNode);
          this.editNode.add(this.editObj);
          console.log("click!", this.intersects, this.editObj);
        }
      }
    } else {
      if (this.intersects.length && !appState.open) {
        let geometry = new THREE.SphereGeometry(1, 16, 16);
        let material = new THREE.MeshBasicMaterial({
          color: 0xff0000,
          transparent: true,
          opacity: 0.4
        });
        // material.wireframe=true
        this.tempMark = new THREE.Mesh(geometry, material);
        this.tempMark.name = "Point_" + ptNumb;
        ptNumb += 1;
        this.markNode.add(this.tempMark);
        this.tempMark.position.copy(this.intersects[0].point);
        // console.log('click!', this.intersects[0].point, cube.position)
        appState.open = true;
        // this.intersects=[]
        console.log("Added:", this.tempMark.name);
      }
    }
  };

  onDocumentKeyDown = event => {
    console.log(event);
    if (this.mapViewMode == false) {
      if (!appState.open) {
        this.currObj.add(this.markNode);
        this.editNode.remove(this.editObj);
        this.scene.add(this.targetNode);
        this.scene.add(this.oNode);
        // this.targetNode.visible=true
        this.mapViewMode = true;
        // appState.open=false
        document.getElementById("hintLine").innerHTML = "text2";
      }
    }
  };

  confirmMark = state => {
    appState.points[appState.selectedObject].push(this.tempMark.name);
    spaStateObj.cnt+=1

    // appState.open=true
    let obj = {
      owner_id: client.auth.user.id,
      type: "point",
      parent: this.currObj.name,
      name: state.name,
      level: state.level,
      descr: state.descr,
      pos: {
        x: this.tempMark.position.x,
        y: this.tempMark.position.y,
        z: this.tempMark.position.z
      }
    };
    appState.pts.push(obj);
    spaStateObj.pts.push(obj);

    db.collection("comments")
      .insertOne({
        owner_id: client.auth.user.id,
        type: "point",
        parent: this.currObj.name,
        name: state.name,
        level: state.level,
        descr: state.descr,
        pos: {
          x: this.tempMark.position.x,
          y: this.tempMark.position.y,
          z: this.tempMark.position.z
        }
      })
      // .then(displayComments);
    console.log("Mark Confirmed");
    appState.open = false;
  };

  updateMark = state => {
    // appState.points[appState.selectedObject].push(this.tempMark.name);
    // // appState.open=true
    // let obj = {
    //   owner_id: client.auth.user.id,
    //   type: "point",
    //   parent: this.currObj.name,
    //   name: state.name,
    //   level: state.level,
    //   descr: state.descr,
    //   pos: {
    //     x: this.tempMark.position.x,
    //     y: this.tempMark.position.y,
    //     z: this.tempMark.position.z
    //   }
    // };
    // appState.pts.push(obj);
    // spaStateObj.pts.push(obj);
    let xPos = toJS(appState.mark.pos).x;

    let obj = appState.pts.find(x => x.pos.x == xPos);
    obj = Object.assign(obj, {
      name: state.name,
      level: state.level,
      descr: state.descr
    });

    obj = spaStateObj.pts.find(x => x.pos.x == xPos);

    obj = Object.assign(obj, {
      name: state.name,
      level: state.level,
      descr: state.descr
    });

    db.collection("comments")
      .updateOne(
        { pos: appState.mark.pos },
        {
          $set: {
            name: state.name,
            level: state.level,
            descr: state.descr
          }
        }
      )
      // .then(displayComments);
    console.log("Mark updated");
    appState.open = false;
  };

  removeMark = () => {
    let xPos = toJS(appState.mark.pos).x;
    let obj = appState.pts.find(x => x.pos.x == xPos);
    let i = appState.pts.indexOf(obj);
    appState.pts.splice(i, 1);
    spaState.pts.splice(i, 1);
    spaStateObj.pts.splice(i, 1);

    console.log("remove", this.currObj, i, toJS(appState.mark.pos).x);
    this.currObj.parent.remove(this.currObj);

    db.collection("comments")
      .deleteOne({ pos: appState.mark.pos })
      .then(result => {
        // result.deletedCount === 1
        return result;
      });
  };

  rejectMark = () => {
    this.markNode.remove(this.tempMark);
    console.log("Mark Rejected");
    appState.open = false;
  };
}

@observer
class WrapDialog extends Component {
  render() {
    console.log("rWD", toJS(appState.mark));
    // if(!spaStateObj.cnt)spaStateObj.cnt=0
    return (
      <FormDialog
        // appState={appState}
        dKey={"open"}
        name={appState.mark.name ? appState.mark.name : "Name_"+spaStateObj.cnt}
        // level={appState.mark ? toJS(appState.mark).level : 'mid'}
        level={appState.mark.level ? appState.mark.level : "mid"}
        descr={appState.mark.descr ? appState.mark.descr : "Comment_"+spaStateObj.cnt}
        // name={"mark"}
        // level={"mid"}
        // descr={"description"}
        classes={styles}
        handleOK={this.props.handleOK}
        handleUpdate={this.props.handleUpdate}
        handleRemove={this.props.handleRemove}
        handleCancel={this.props.handleCancel}
      />
    );
  }
}

@observer
class WrapNestedList extends Component {
  render() {
    console.log("rWNL", toJS(this.props.appState));
    return <NestedList appState={this.props.appState} />;
  }
}

@observer
class ThreeView extends Component {
  constructor() {
    super();
    this.tc = new ThreeCanvas();
    console.log("tc", this.tc);
  }

  // componentWillMount = () => {
  componentDidMount = () => {
    this.tc.init(this.props.mountId);
    document.getElementById("hintLine").innerHTML = "text";

    //   let v = document.getElementById(this.props.mountId)
    //   v.appendChild(this.tc.renderer.domElement)
  };

  componentWillUnmount = () => {
    let v = document.getElementById(this.props.mountId);
    v.removeChild(this.tc.renderer.domElement);
    // let v1 = document.getElementById('main-id-2')
    // v1.removeChild(this.tc.renderer.domElement)
  };

  render = () => {
    console.log("rend ThreeView", appState.mark);
    return (
      <div>
        {/*<div style={{zIndex:7}}>*/}
        {/*// <FormDialog />*/}
        {/*</div>*/}
        {/* <ViewPts a1={a1}/> */}
        {/* <MobxTst pts={appState.pts} /> */}

        <FloatHint pt={appState.pt} />

        <div
          id="2"
          onMouseMove={e => {
            e.preventDefault(); //console.log(e.clientX);
          }}
          // onMouseOver={e=>{console.log(e)}}
          onMouseEnter={e => {
            console.log("Enter");
            appState.mouseInPanel = true;
            // this.tc.intersects.length=0
          }}
          onMouseLeave={e => {
            appState.mouseInPanel = false;
            console.log("Leave");
          }}
          onClick={e => {
            console.log(e);
          }}
          style={{
            height: "100%",
            // display:"inline",
            position: "fixed",
            top: 0,
            left: 0,
            width: "20%",
            color: "0xffffff",
            backgroundColor: "rgba(0,100,0,0.4)",
            border: "1px solid #44ffff",
            opacity: "1",
            zIndex: 220
            // textAlign: 'center',
            // verticalAlign: 'middle',
            // lineHeight: '40px'
          }}
        >
          {/* <ViewPts spaState={spaStateObj}/> */}

          <WrapNestedList appState={spaStateObj} />

          {/* <DataView appState={appState} pts={appState.pts}/>
          <WrapNestedList appState={appState} pts={appState.pts}/> */}
        </div>

        <WrapDialog
          // appState={appState}
          handleOK={this.tc.confirmMark}
          handleUpdate={this.tc.updateMark}
          handleRemove={this.tc.removeMark}
          handleCancel={this.tc.rejectMark}
        />

        {/*<div id='hintLinet' style={{height: "40px",
                                          // display:"inline",
                                          position: "fixed",
                                          top:"0%",
                                          width:"100%",
                                          color:"0xffffff",
                                          backgroundColor: "rgba(0,100,0,0.4)",
                                          border:'1px solid #44ffff',
                                          opacity:"1",
                                          textAlign: 'center',
                                          verticalAlign: 'middle',
                                          lineHeight: '40px'
                                                      }} >
                                                      </div>
*/}
        <div
          id="hintLine"
          style={{
            height: "40px",
            // display:"inline",
            position: "fixed",
            bottom: "0%",
            width: "100%",
            color: "0xffffff",
            backgroundColor: "rgba(0,100,0,0.4)",
            border: "1px solid #44ffff",
            opacity: "1",
            textAlign: "center",
            verticalAlign: "middle",
            lineHeight: "40px"
          }}
        />
      </div>
    );
  };
}
export { db };
export default ThreeView;
