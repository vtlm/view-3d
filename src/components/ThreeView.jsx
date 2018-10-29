import React, { Component } from 'react'
import * as THREE from 'three'
import OrbitControls from 'orbit-controls-es6'
import GLTFLoader from 'three-gltf-loader'

import parms from '../parms'

//import {store} from '../store'

var INTERSECTED

class ThreeCanvas {
  constructor(renderer, box) {
    // this.renderer
    // this.obsts = []
    this.raycaster = new THREE.Raycaster()
    this.mouse = new THREE.Vector2()
    this.tVect = new THREE.Vector3()
    this.cLength = 0
    this.mapViewMode = true
    this.markNode=null
  }

  createCube = (pos = new THREE.Vector3(), material) => {
    var geometry = new THREE.BoxGeometry(1, 1, 1)
    var cube = new THREE.Mesh(geometry, material)
    cube.position.copy(pos)
    //this.scene.add(cube)

    let dir = new THREE.Vector3(0, 2, 0)

    //normalize the direction vector (convert to vector of length 1)
    dir.normalize()

    let origin = new THREE.Vector3(0, 0, 0)
    let length = 5
    let hex = 0xff0000

    let arrowHelper = new THREE.ArrowHelper(dir, origin, length, hex)
    arrowHelper.name = 'speedArrow'
    // console.log(arrowHelper)
    cube.add(arrowHelper)
    // console.log(cube.getObjectByName('speedArrow'))
    return cube
  }

  createPlane = parms => {
    // console.log('pparms',parms)
    let geometry = new THREE.PlaneGeometry(parms.size.width, parms.size.length)
    let material = new THREE.MeshBasicMaterial({
      color: parms.color,
      transparent: true,
      opacity: 0.4
    })
    let plane = new THREE.Mesh(geometry, material)
    //plane.position.z = parms.size.length / 2
    plane.position.y = parms.heightShift
    plane.rotation.x = -Math.PI / 2
    return plane
  }

  makeTextSprite(message, parameters) {
    if (parameters === undefined) parameters = {}

    var fontface = parameters.hasOwnProperty('fontface')
      ? parameters['fontface']
      : 'Arial'

    var fontsize = parameters.hasOwnProperty('fontsize')
      ? parameters['fontsize']
      : 18

    var borderThickness = parameters.hasOwnProperty('borderThickness')
      ? parameters['borderThickness']
      : 4

    var borderColor = parameters.hasOwnProperty('borderColor')
      ? parameters['borderColor']
      : { r: 0, g: 0, b: 0, a: 1.0 }

    var backgroundColor = parameters.hasOwnProperty('backgroundColor')
      ? parameters['backgroundColor']
      : { r: 255, g: 255, b: 255, a: 1.0 }
    // var spriteAlignment = THREE.SpriteAlignment.topLeft;

    var canvas = document.createElement('canvas')
    var context = canvas.getContext('2d')
    context.font = 'Bold ' + fontsize + 'px ' + fontface

    // get size data (height depends only on font size)
    var metrics = context.measureText(message)
    var textWidth = metrics.width

    // background color
    context.fillStyle =
      'rgba(' +
      backgroundColor.r +
      ',' +
      backgroundColor.g +
      ',' +
      backgroundColor.b +
      ',' +
      backgroundColor.a +
      ')'
    // border color
    context.strokeStyle =
      'rgba(' +
      borderColor.r +
      ',' +
      borderColor.g +
      ',' +
      borderColor.b +
      ',' +
      borderColor.a +
      ')'
    context.lineWidth = borderThickness
    // roundRect(context, borderThickness/2, borderThickness/2, textWidth + borderThickness, fontsize * 1.4 + borderThickness, 6);
    // 1.4 is extra height factor for text below baseline: g,j,p,q.

    // text color
    context.fillStyle = 'rgba(0, 0, 0, 1.0)'
    context.fillText(message, borderThickness, fontsize + borderThickness)

    // canvas contents will be used for a texture
    var texture = new THREE.Texture(canvas)
    texture.needsUpdate = true
    var spriteMaterial = new THREE.SpriteMaterial({
      map: texture
      // useScreenCoordinates: false, alignment: spriteAlignment
    })
    var sprite = new THREE.Sprite(spriteMaterial)
    // sprite.scale.set(100,50,1.0);
    return sprite
  }

  init = mountId => {
    this.el = document.getElementById(mountId)
    console.log('divSize', this.el.clientWidth, this.el.clientHeight, mountId)

    let scene = new THREE.Scene()
    this.scene = scene
    // this.scene.background = new THREE.Color(0xff5555)
    this.oNode = new THREE.Object3D()
    scene.add(this.oNode)
    this.targetNode = new THREE.Object3D()
    scene.add(this.targetNode)
    // this.markNode = new THREE.Object3D()
    // scene.add(this.markNode)
    this.editNode = new THREE.Object3D()
    scene.add(this.editNode)

    let gridHelper = new THREE.GridHelper(200, 20)
    this.scene.add(gridHelper)

    // var boxHelper = new THREE.BoxHelper()
    // scene.add(boxHelper)

    let camAspect = this.el.clientWidth / (this.el.clientHeight / 1)
    // console.log()

    let camera = new THREE.PerspectiveCamera(
      75,
      // window.innerWidth / (window.innerHeight / 1),
      camAspect,
      0.1,
      1000
    )
    this.camera = camera
    // var camera = new THREE.OrthographicCamera( 75, window.innerWidth/(window.innerHeight/1), 0.1, 1000 );
    // var	camera = new THREE.CombinedCamera( window.innerWidth / 2, window.innerHeight / 2, 70, 1, 1000, - 500, 1000 );

    this.renderer = new THREE.WebGLRenderer({ alpha: true })
    // this.renderer.setSize(window.innerWidth, window.innerHeight / 1)
    this.renderer.setSize(this.el.clientWidth, this.el.clientHeight / 1)
    // var clock = new THREE.Clock()

    this.el.appendChild(this.renderer.domElement)

    let geometry = new THREE.SphereGeometry(1, 16, 16)
    let material = new THREE.MeshBasicMaterial({
      color: 0xff8800,
      transparent: true,
      opacity: 0.7
    })
    // material.wireframe=true
    this.cube = new THREE.Mesh(geometry, material)
    this.cube.position.z = 20
    scene.add(this.cube)
    this.arrowHelper = new THREE.ArrowHelper(
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 1, 0),
      10,
      0xff0000
    )
    scene.add(this.arrowHelper)
    //
    // this.box = cube

    geometry = new THREE.CylinderGeometry(2, 4, 30, 28, 10)

    // material
    material = new THREE.MeshPhongMaterial({
      color: 0xaaaaaa,
      shading: THREE.FlatShading,
      polygonOffset: true,
      polygonOffsetFactor: 1, // positive value pushes polygon further away
      polygonOffsetUnits: 1
    })

    // mesh
    var mesh = new THREE.Mesh(geometry, material)
    // this.targetNode.add( mesh );

    // wireframe - old way
    /*
      var helper = new THREE.EdgesHelper( mesh, 0xffffff );
      //var helper = new THREE.WireframeHelper( mesh, 0xffffff ); // alternate
      helper.material.linewidth = 2;
      scene.add( helper );
      */

    // wireframe - new way
    var geo = new THREE.EdgesGeometry(mesh.geometry) // or WireframeGeometry
    var mat = new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 1 })
    var wireframe = new THREE.LineSegments(geo, mat)
    mesh.add(wireframe)

    mesh.position.y = 15

    // material = new THREE.MeshBasicMaterial( {color: 0xffff00} );
    // var cylinder = new THREE.Mesh( geometry, material );
    // cylinder.position.y=10
    // scene.add( cylinder );

    camera.position.z = -45
    camera.position.y = 25

    let light = new THREE.HemisphereLight(0xffffbb, 0x080820, 1)
    scene.add(light)

    const controls = new OrbitControls(camera, this.renderer.domElement)
    controls.enabled = true
    controls.maxDistance = 1500
    controls.minDistance = 0

    // LIGHTS
    let hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.65)
    hemiLight.color.setHSL(0.6, 1, 0.6)
    hemiLight.groundColor.setHSL(0.095, 1, 0.75)
    hemiLight.position.set(110, 500, 110)
    scene.add(hemiLight)

    let dirLight = new THREE.DirectionalLight(0xffffff, 0.41)
    dirLight.color.setHSL(0.1, 1, 0.95)
    dirLight.position.set(-1, 1.75, 1)
    dirLight.position.multiplyScalar(450)
    scene.add(dirLight)

    // console.log('areas', parms.areas)
    Object.values(parms.areas).forEach(x => this.scene.add(this.createPlane(x)))

    this.materialBlue = new THREE.MeshBasicMaterial({
      color: 0x0000ff,
      wireframe: true
    })
    let materialGreen = new THREE.MeshBasicMaterial({ color: 0x00ff00 })
    materialGreen.wireframe = true
    let materialRed = new THREE.MeshBasicMaterial({ color: 0xff0000 })
    materialRed.wireframe = true
    this.materialGreen = materialGreen
    this.materialRed = materialRed

    this.divElem = document.createElement('div')
    // this.divElem.style.position = 'relative' //'absolute'
    this.divElem.style.position = 'absolute'
    this.divElem.style.zIndex = 3
    // divElem.style.color = 'white';
    this.divElem.innerHTML = 'text' //+ i;
    // this.el.appendChild(this.divElem)

    // Instantiate a loader
    const loader = new GLTFLoader()
    // Optional: Provide a DRACOLoader instance to decode compressed mesh data
    // THREE.DRACOLoader.setDecoderPath( '/examples/js/libs/draco' );
    // loader.setDRACOLoader( new THREE.DRACOLoader() );

    // Load a glTF resource
    loader.load(
      // resource URL
      'Girder_XBox.gltf',
      // 'bm.gltf',
      // called when the resource is loaded
      gltf => {
        // this.targetNode.add( gltf.scene );

        gltf.scene.children
          // .filter(x => x.type == 'Mesh')
          .filter(x => x.name.includes('Girder'))
          .forEach((x,i) => {
            this.targetNode.add(x);
            let divElem = document.createElement('div')
            divElem.style.position = 'absolute'
            // // divElem.style.zIndex = 3
            // // divElem.style.color = 'white';
            divElem.innerHTML = 'object_' + i
            x.userData = divElem
            this.el.appendChild(divElem)
          })

          gltf.scene.children
            .filter(x => x.name.includes('Mesh'))
            .forEach((x,i) => {
              this.oNode.add(x);
              let divElem = document.createElement('div')
              divElem.style.position = 'absolute'
              // // divElem.style.zIndex = 3
              // // divElem.style.color = 'white';
              divElem.innerHTML = 'object_' + i
              x.userData = divElem
              this.el.appendChild(divElem)
            })

        console.log('gltf',gltf,this.targetNode)

        // gltf.animations // Array<THREE.AnimationClip>
        // gltf.scene // THREE.Scene
        // gltf.scenes // Array<THREE.Scene>
        // gltf.cameras // Array<THREE.Camera>
        // gltf.asset // Object
      },
      // called while loading is progressing
      function(xhr) {
        console.log(xhr.loaded / xhr.total * 100 + '% loaded')
      },
      // called when loading has errors
      function(error) {
        console.log('An error happened')
      }
    )

    // for (let i = 1; i < 500; i++) {
    //   let obj = this.createCube(
    //     // new THREE.Vector3(Math.random() * 20 - 10, 0, -Math.random() * 20 - 5), i>250?materialGreen:materialRed
    //     new THREE.Vector3(0, 0, 0),
    //     i > 250 ? materialGreen : materialRed
    //   )
    //
    //   let divElem = document.createElement('div')
    //   divElem.style.position = 'absolute'
    //   // divElem.style.zIndex = 3
    //   // divElem.style.color = 'white';
    //   divElem.innerHTML = 'sphere_' + i
    //   obj.userData = divElem
    //   // this.el.appendChild(divElem)
    //
    //   this.oNode.add(obj)
    // }

    // var spritey = this.makeTextSprite(' Hello, ', {
    //   fontsize: 14,
    //   borderColor: { r: 255, g: 0, b: 0, a: 1.0 },
    //   backgroundColor: { r: 255, g: 100, b: 100, a: 0.8 }
    // })
    // spritey.position.set(-5, 1, 0)
    // scene.add(spritey)
    // var spritey = this.makeTextSprite(' World! ', {
    //   fontsize: 12,
    //   fontface: 'Georgia',
    //   borderColor: { r: 0, g: 0, b: 255, a: 1.0 }
    // })
    // spritey.position.set(5, 1, 0)
    // scene.add(spritey)

    // this.projector=new THREE.Projector()
    this.pt3d = new THREE.Vector3()
    this.pt2d = null

    this.scene.add(this.ArrowHelper)

    const animate = () => {
      if (enableAnim) requestAnimationFrame(animate)

      for (let i = 0; i < this.oNode.children.length; i++) {
        // this.oNode.children[i].position.y += 0.5-Math.random()
        this.oNode.children[i].visible = Math.random() > 0.5 ? true : false
      }

      render()
    }

    const render = () => {
      var delta = clock.getDelta()

      if (mixer !== undefined) {
        mixer.update(delta)
      }

      this.renderer.render(this.scene, camera)
    }


    const animate2 = () => {
      if (this.mapViewMode) {

        // this.updateLabels(this.targetNode)

        this.raycaster.setFromCamera(this.mouse, this.camera)

        // calculate objects intersecting the picking ray
        this.intersects = this.raycaster.intersectObjects(
          this.targetNode.children
        )

        if (this.intersects.length > 0) {
          if (INTERSECTED != this.intersects[0].object) {
            if (INTERSECTED)
              INTERSECTED.material.color.setHex(INTERSECTED.currentHex)
            INTERSECTED = this.intersects[0].object
            INTERSECTED.currentHex = INTERSECTED.material.color.getHex()
            INTERSECTED.material.color.setHex(0xff0000)
            // console.log(this.intersects)
            // console.log(this.intersects[0].point)
          }
        } else {
          if (INTERSECTED)
            INTERSECTED.material.color.setHex(INTERSECTED.currentHex)
          INTERSECTED = null
        }
      } else {
        this.raycaster.setFromCamera(this.mouse, this.camera)

        // calculate objects intersecting the picking ray
        this.intersects = this.raycaster.intersectObjects(
          this.editNode.children
        )

        if (this.intersects.length > 0) {
          // if (INTERSECTED != this.intersects[0].object) {
          //   if (INTERSECTED)
          //     INTERSECTED.material.color.setHex(INTERSECTED.currentHex)
          //   INTERSECTED = this.intersects[0].object
          //   INTERSECTED.currentHex = INTERSECTED.material.color.getHex()
          //   INTERSECTED.material.color.setHex(0xff0000)
          //   console.log(this.intersects)
          //   // console.log(this.intersects[0].point)
          // }
          this.cube.visible = true
          this.arrowHelper.visible = true

          this.cube.position.copy(this.intersects[0].point)
          this.arrowHelper.position.copy(this.intersects[0].point)
          this.arrowHelper.setDirection(this.intersects[0].face.normal)
        } else {
          if (INTERSECTED)
            INTERSECTED.material.color.setHex(INTERSECTED.currentHex)
          INTERSECTED = null

          this.cube.visible = false
          this.arrowHelper.visible = false
        }
      }

      // console.log(this.scene.children)
      // update the picking ray with the camera and mouse position

      this.renderer.render(this.scene, camera)

      requestAnimationFrame(animate2)
    }

    // init_3()
    // animate()
    // render()

    window.addEventListener('mousemove', this.onMouseMove, false)
    window.addEventListener('resize', this.onWindowResize, false)
    document.addEventListener('mousedown', this.onDocumentMouseDown, false)
    document.addEventListener('keydown', this.onDocumentKeyDown, false)
    animate2()
  }

  updateLabels=(node)=>{

    // console.log(node)

    node.children.forEach(x=>{
      if(x.visible){

  this.divElem = x.userData
  // this.divElem.style.visibility=this.oNode.children[i + indOffs].visible?'visible':'hidden'
  this.pt3d.copy(x.position)
  this.pt2d = this.pt3d.project(this.camera)
  this.pt2d.x = ((this.pt2d.x + 1) / 2) * this.el.clientWidth
  let x1 = (this.pt2d.x + 1) / 2 // * this.el.clientWidth;
  this.pt2d.y = (-(this.pt2d.y - 1) / 2) * this.el.clientHeight
  this.divElem.style.left = this.pt2d.x + 'px'
  this.divElem.style.top = this.pt2d.y + 'px'
  this.divElem.innerHTML =
    this.pt2d.x.toFixed(2) + ' ' + this.pt2d.y.toFixed(2)
  }else
  {
    x.userData.style.visibility='hidden'
  }
  })
}


  onMouseMove = event => {
    // calculate mouse position in normalized device coordinates
    // (-1 to +1) for both components
    this.mouse.x = event.clientX / window.innerWidth * 2 - 1
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1
    // console.log(this.mouse)
  }

  onWindowResize = () => {
    this.camera.aspect = window.innerWidth / window.innerHeight
    this.camera.updateProjectionMatrix()

    this.renderer.setSize(this.el.clientWidth, this.el.clientHeight / 1)
  }

  onDocumentMouseDown = () => {
    if (this.mapViewMode) {
      if (this.intersects.length) {
        // this.targetNode.visible=false
        this.scene.remove(this.targetNode)
        this.scene.remove(this.oNode)
        this.mapViewMode=false
        this.currObj=this.intersects[0].object
        this.editObj=this.intersects[0].object.clone()
        // this.editObj.position.copy(new THREE.Vector3())
        this.editObj.position.x=0
        this.editObj.position.z=0
        this.markNode=new THREE.Object3D()
        this.editObj.add(this.markNode)
        this.editNode.add(this.editObj)
        console.log('click!', this.intersects,this.editObj)
      }
    } else {
      if (this.intersects.length) {
        let geometry = new THREE.SphereGeometry(1, 16, 16)
        let material = new THREE.MeshBasicMaterial({
          color: 0xff0000,
          transparent: true,
          opacity: 0.4
        })
        // material.wireframe=true
        let cube = new THREE.Mesh(geometry, material)
        this.markNode.add(cube)
        cube.position.copy(this.intersects[0].point)
        console.log('click!', this.intersects[0].point, cube.position)
      }
    }
  }

  onDocumentKeyDown = event => {
    console.log(event)
    if(this.mapViewMode==false){
      this.currObj.add(this.markNode)
      this.editNode.remove(this.editObj)
      this.scene.add(this.targetNode)
      this.scene.add(this.oNode)
      // this.targetNode.visible=true
      this.mapViewMode=true
      document.getElementById('hintLine').innerHTML='text2'
    }
  }

  update = msg => {
    this.pt3d.copy(this.cube.position)
    this.pt2d = this.pt3d.project(this.camera)
    this.pt2d.x = (this.pt2d.x + 1) / 2 * this.el.clientWidth
    let x1 = (this.pt2d.x + 1) / 2 // * this.el.clientWidth;
    this.pt2d.y = -(this.pt2d.y - 1) / 2 * this.el.clientHeight
    // console.log('pt2d',this.pt3d,this.pt2d,this.el.clientWidth,x1,this.cube.position)
    this.divElem.style.position = 'absolute'
    // this.divElem.style.position = 'relative'
    this.divElem.style.left = this.pt2d.x + 'px'
    this.divElem.style.top = this.pt2d.y + 'px'
    // this.divElem.style.top = this.pt2d.y - this.el.clientHeight + 'px'
    this.divElem.innerHTML =
      this.pt2d.x.toFixed(2) + ' ' + this.pt2d.y.toFixed(2)

    let data = msg.objsFrame
    let indOffs = 0
    // console.log(msg.bus)
    if (msg.bus == 'can1') {
      for (let i = 250; i < 500; i++) {
        this.oNode.children[i].visible = false
      }
      indOffs = 250
      // return
    } else {
      for (let i = 1; i < 250; i++) {
        this.oNode.children[i].visible = false
        this.oNode.children[i].userData.style.visibility = 'hidden'
      }
    }

    //  this.oNode.children.forEach(x=>x.visible=false)
    //    this.box.position.z += 10
    Object.values(data)
      .filter(t => t.updated)
      .forEach((t, i) => {
        // console.log(t,i)
        let colorId = 'dangerArea'

        let drWidth = t.Object_Width || 0.1
        let drLength = t.Object_Length || 0.1

        // let str = t.Object_ID + ' ' + t.Object_DistLong + ' ' + t.Object_DistLat

        this.tVect.x = t.Object_VrelLat
        this.tVect.y = 0
        this.tVect.z = t.Object_VrelLong
        this.cLength = this.tVect.length()
        this.tVect.normalize()
        // console.log(tVect)

        let cObj = this.oNode.children[i + indOffs]

        let speedArrow = cObj.getObjectByName('speedArrow')
        // console.log(speedArrow)
        speedArrow.setDirection(this.tVect)
        speedArrow.setLength(this.cLength)

        // // let str = t.rcs
        let x = 1 * t.Object_DistLat // + offsX
        let y = 1.0 * t.Object_DistLong // + offsY
        // drawRect(ctx, x, y, drWidth * resX, drLength * resY, t.colorId)

        this.oNode.children[i + indOffs].scale.x = drWidth
        this.oNode.children[i + indOffs].scale.z = drLength

        this.oNode.children[i + indOffs].position.z = y

        if (msg.bus == 'can1') this.oNode.children[i + indOffs].position.y = x
        else this.oNode.children[i + indOffs].position.x = x

        this.oNode.children[i + indOffs].visible = true
        if (t.colorId == 'dangerArea')
          this.oNode.children[i + indOffs].material = this.materialRed
        else this.oNode.children[i + indOffs].material = this.materialBlue
        // if(t.colorId=='dangerArea')
        // console.log(t.colorId)
        // console.log(i)

        // this.divElem = this.oNode.children[i + indOffs].userData
        // this.divElem.style.visibility=this.oNode.children[i + indOffs].visible?'visible':'hidden'
        // // this.divElem.style.visibility=this.oNode.children[i + indOffs].visible?'visible':'hidden'
        // // console.log(this.divEl)
        // this.pt3d.copy(this.oNode.children[i + indOffs].position)
        // this.pt2d = this.pt3d.project(this.camera)
        // this.pt2d.x = ((this.pt2d.x + 1) / 2) * this.el.clientWidth
        // let x1 = (this.pt2d.x + 1) / 2 // * this.el.clientWidth;
        // this.pt2d.y = (-(this.pt2d.y - 1) / 2) * this.el.clientHeight
        // // console.log('pt2d',this.pt3d,this.pt2d,this.el.clientWidth,x1,this.cube.position)
        // // this.divElem.style.position = 'relative'
        // this.divElem.style.left = this.pt2d.x + 'px'
        // this.divElem.style.top = this.pt2d.y + 'px'
        // this.divElem.innerHTML =
        //   this.pt2d.x.toFixed(2) + ' ' + this.pt2d.y.toFixed(2)

        // console.log()
        // this.pt3d.copy(this.oNode.children[i + indOffs].position)
        // this.pt2d=this.pt3d.project(this.camera)
        // this.pt2d.x = (this.pt2d.x + 1)/2 * this.el.clientWidth;
        // let x1 = (this.pt2d.x + 1)/2// * this.el.clientWidth;
        // this.pt2d.y = - (this.pt2d.y - 1)/2 * this.el.clientHeight;
        // console.log('pt2d',this.pt3d,this.pt2d,this.el.clientWidth,x1,this.oNode.children[i + indOffs].position)

        // this.objs[this.readyFrameInd]

        // ctx.fillStyle = '#000000'
        // if (state.config.Labels)
        // ctx.fillText(str, x + (lblOffsX * resX) / 2, y - (lblOffsY * resY) / 2)
        // console.log('rdgo',t.Object_ID,t.Object_DistLat,t.Object_DistLong,x,y)
      })
    this.renderer.render(this.scene, this.camera)
  }
}

class ThreeView extends Component {
  constructor() {
    super()
    this.tc = new ThreeCanvas()
  }

  // componentWillMount = () => {
  componentDidMount = () => {
    //   let v = document.getElementById(this.props.mountId)
    this.tc.init(this.props.mountId)
    document.getElementById('hintLine').innerHTML='text'

    //   v.appendChild(this.tc.renderer.domElement)

    // let v1 = document.getElementById('main-id-2')
    // v1.appendChild(this.tc.renderer.domElement)
  }

  componentWillUnmount = () => {
    let v = document.getElementById(this.props.mountId)
    v.removeChild(this.tc.renderer.domElement)
    // let v1 = document.getElementById('main-id-2')
    // v1.removeChild(this.tc.renderer.domElement)
  }

  render = () => {
    return (
      <div id='hintLine' style={{height: "40px",
                  // display:"inline",
                  position: "fixed",
                  bottom:"0%",
                  width:"100%",
                  color:"0xffffff",
                  backgroundColor: "rgba(0,100,0,0.4)",
                  border:'1px solid #44ffff',
                  opacity:"1",
                  textAlign: 'center',
                  verticalAlign: 'middle',
                  lineHeight: '40px'
                              }} />
    )
  }
}

export default ThreeView
