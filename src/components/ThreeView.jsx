import React, { Component } from 'react'
import * as THREE from 'three'
import OrbitControls from 'orbit-controls-es6'
import GLTFLoader from 'three-gltf-loader'

import { Stitch, AnonymousCredential, RemoteMongoClient } from 'mongodb-stitch-browser-sdk'

import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import MenuItem from '@material-ui/core/MenuItem';




import { observable } from 'mobx'
import { observer } from 'mobx-react'

class AppState {
  @observable currentTime = 0
  @observable objects = []
  @observable selectedObject=''
  @observable tagJSON = {}
  @observable points={}
  @observable open=false
  // constructor() {
  //       this.currentTime=4;
  //         setInterval(() => {
  //             console.log('inc',this.currentTime)
  //             this.currentTime += 1;
  //         }, 1000);
  //     }
}
const appState = new AppState()


import parms from '../parms'

//import {store} from '../store'

const client = Stitch.initializeDefaultAppClient("test1-jwipq");
client.auth
  .loginWithCredential(new AnonymousCredential())
// Get a MongoDB Service Client
const mongodb = client.getServiceClient(
  RemoteMongoClient.factory,
  "mongodb-atlas"
);
// Get a reference to the blog database
const db = mongodb.db("blog");

function displayComments() {
  db.collection("comments")
    .find({}, { limit: 1000 })
    .asArray()
    .then(docs => console.log(docs))
  // db.collection("comments")
  //   .find({}, { limit: 1000 })
  //   .asArray()
  //   .then(docs => docs.map(doc => `<div>${doc.owner_id},${doc.comment}</div>`))
  //   .then(comments => document.getElementById("comments").innerHTML = comments)
}

function displayCommentsOnLoad() {
  client.auth
    .loginWithCredential(new stitch.AnonymousCredential())
    .then(displayComments)
    .catch(console.error);
}

function addComment() {
  const newComment = document.getElementById("new_comment");
  console.log("add comment", client.auth.user.id)
  db.collection("comments")
    .insertOne({ owner_id: client.auth.user.id, comment: newComment.value, pts:[1,3,5] })
    .then(displayComments);
  newComment.value = "";
}




const styles = theme => ({
  container: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
  },
  dense: {
    marginTop: 16,
  },
  menu: {
    width: 200,
  },
});

const currencies = [
  {
    value: 'USD',
    label: 'Низкая',
  },
  {
    value: 'EUR',
    label: 'Средняя',
  },
  {
    value: 'BTC',
    label: 'Высокая',
  },
];



@observer
class FormDialog extends React.Component {
  state = {
      open: false,
      name: 'Добавьте Название',
     descr: 'Добавьте Описание',
     age: '',
     multiline: 'Controlled',
     currency: 'EUR',
   };

   handleChange = name => event => {
     console.log('onChange',name)
     console.log(event.target,event.target.value)
     this.setState({[name]:event.target.value})
   };

  handleOK = () => {
    appState.open=false
    console.log(this.state)
    this.props.handleOK(this.state)
  };

  handleClose = () => {
    appState.open=false
    this.props.handleCancel()
  };

  render() {
    const { classes } = this.props;
    return (
      <div>
        {/*<Button onClick={this.handleClickOpen}>Open form dialog</Button>*/}
        <Dialog
          open={this.props.appState.open}
          onClose={this.handleClose}
          aria-labelledby="form-dialog-title"
        >
          <DialogTitle id="form-dialog-title">Метка</DialogTitle>

          <DialogContent>

          {/*<DialogContentText>
            Имя
          </DialogContentText>
*/}
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Название"
            defaultValue={this.state.name}
            type="email"
            fullWidth
            onChange={this.handleChange('name')}
          />

          {/*<DialogContentText>
            Описание
          </DialogContentText>
*/}

          <TextField
                    id="filled-select-currency"
                    select
                    label="Критичность"
                    className={classes.textField}
                    value={this.state.currency}
                    onChange={this.handleChange('currency')}
                    SelectProps={{
                      MenuProps: {
                        className: classes.menu,
                      },
                    }}
                    // helperText="Please select your currency"
                    margin="normal"
                    variant="filled"
                  >
                    {currencies.map(option => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
<TextField
            margin="dense"
            id="descr"
            label="Описание"
            defaultValue={this.state.descr}
            type="email"
            fullWidth
            onChange={this.handleChange('descr')}
          />
          </DialogContent>

          <DialogActions>
            <Button onClick={this.handleClose} color="primary">
              Отмена
            </Button>
            <Button onClick={this.handleOK} color="primary">
              Добавить
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}



var INTERSECTED
var ptNumb=1

class ThreeCanvas {
  constructor(renderer, box) {
    // this.renderer
    // this.obsts = []
    this.raycaster = new THREE.Raycaster()
    this.mouse = new THREE.Vector2()
    this.mouseR = new THREE.Vector2()
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

    this.divElemMark = document.createElement('div')
    this.divElemMark.style.position = 'absolute'
    this.divElemMark.style.zIndex = 3
    // divElem.style.color = 'white';
    this.divElemMark.innerHTML = 'text' //+ i;
    this.el.appendChild(this.divElemMark)

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
            appState.objects.push(x.name)
            appState.points[x.name]=[]
            this.targetNode.add(x);
            // let divElem = document.createElement('div')
            // divElem.style.position = 'absolute'
            // // // divElem.style.zIndex = 3
            // // // divElem.style.color = 'white';
            // divElem.innerHTML = 'object_' + i
            // x.userData = divElem
            // this.el.appendChild(divElem)
          })

          gltf.scene.children
            .filter(x => x.name.includes('Mesh'))
            .forEach((x,i) => {
              this.oNode.add(x);
              // let divElem = document.createElement('div')
              // divElem.style.position = 'absolute'
              // // // divElem.style.zIndex = 3
              // // // divElem.style.color = 'white';
              // divElem.innerHTML = 'object_' + i
              // x.userData = divElem
              // this.el.appendChild(divElem)
            })

        // console.log('gltf',gltf,this.targetNode)

        db.collection("comments")
          .find({type:'point'}, { limit: 1000 })
          .asArray()
          .then(docs => {console.log(docs)
            docs.forEach(x=>{
              if(x.parent){
                console.log(x.parent,x.pos)

                let geometry = new THREE.SphereGeometry(1, 16, 16)
                let material = new THREE.MeshBasicMaterial({
                  color: 0xff0000,
                  transparent: true,
                  opacity: 0.4
                })
                // material.wireframe=true
                let cube = new THREE.Mesh(geometry, material)
                cube.name='Point_'+ptNumb
                ptNumb+=1
                let parentObj=this.scene.getObjectByName(x.parent)
                if(parentObj){
                  let markNode=new THREE.Object3D()
                  parentObj.add(markNode)
                  markNode.add(cube)
                  cube.position.set(x.pos.x,x.pos.y,x.pos.z)
                  // console.log('click!', this.intersects[0].point, cube.position)
                  // appState.points[appState.selectedObject].push(cube.name)
              }
              }
            })
          })

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
          this.targetNode.children,true
        )
        // console.log(this.intersects.length)
// this.intersects.length=[]
        if (this.intersects.length > 0) {
          if (INTERSECTED != this.intersects[0].object) {
            if (INTERSECTED)
              INTERSECTED.material.color.setHex(INTERSECTED.currentHex)
            INTERSECTED = this.intersects[0].object
            INTERSECTED.currentHex = INTERSECTED.material.color.getHex()
            if(INTERSECTED.name.includes('Point')){
              // console.log('Point')
              INTERSECTED.material.color.setHex(0xffff00)
              this.divElemMark.style.left = this.mouseR.x + 'px'
              this.divElemMark.style.top = this.mouseR.y + 'px'
              // console.log(this.divElemMark)
              this.divElemMark.style.visibility='visible'
            }else{
            this.divElemMark.style.visibility='hidden'
            INTERSECTED.material.color.setHex(0xff0000)
            appState.selectedObject=INTERSECTED.name

          }
            // console.log(this.intersects)
            // console.log(this.intersects[0].point,this.intersects[0].object)
            // appState.objects.push('ddd')
          }
        } else {
          if (INTERSECTED)
            INTERSECTED.material.color.setHex(INTERSECTED.currentHex)
          INTERSECTED = null
          appState.selectedObject=''
          this.divElemMark.style.visibility='hidden'

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
    this.mouseR.x = event.clientX
    this.mouseR.y = event.clientY
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
        displayComments()
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
        this.tempMark = new THREE.Mesh(geometry, material)
        this.tempMark.name='Point_'+ptNumb
        ptNumb+=1
        this.markNode.add(this.tempMark)
        this.tempMark.position.copy(this.intersects[0].point)
        // console.log('click!', this.intersects[0].point, cube.position)
        appState.open=true
      }
    }
  }

  onDocumentKeyDown = event => {
    console.log(event)
    if(this.mapViewMode==false){
      if(!appState.open){
      this.currObj.add(this.markNode)
      this.editNode.remove(this.editObj)
      this.scene.add(this.targetNode)
      this.scene.add(this.oNode)
      // this.targetNode.visible=true
      this.mapViewMode=true
      // appState.open=false
      document.getElementById('hintLine').innerHTML='text2'
    }
    }
  }

  confirmMark=(state)=>{
    appState.points[appState.selectedObject].push(this.tempMark.name)
    appState.open=true
    db.collection("comments")
      .insertOne({ owner_id: client.auth.user.id, type: 'point',
      parent:this.currObj.name,
      name:state.name,
      level:state.currency,
      descr:state.descr,
        pos:{x:this.tempMark.position.x,y:this.tempMark.position.y,z:this.tempMark.position.z}})
      .then(displayComments);
    console.log('Mark Confirmed')
    appState.open=false
  }

  rejectMark=()=>{
    this.markNode.remove(this.tempMark)
    console.log('Mark Rejected')
    appState.open=false
  }

}

@observer
class DataView extends Component{

  printName(){
    return this.props.appState.points[this.props.appState.selectedObject].length>0?'Метки:':null
  }

  render(){
    // return null
    // console.log(this.props.appState.points[this.props.appState.selectedObject])
    return(
      <div style={{fontSize:'small'}}>
      <div style={{color:'#4444aa'}}>{'Вышки:'}</div>
      {this.props.appState.objects.map(x=>
        <div style={{color:this.props.appState.selectedObject==x?"#ff0000":"#000000"}}>{x}</div>)}
      {/*<div>{this.props.appState.selectedObject}</div>*/}
      {this.props.appState.selectedObject != ''?<div>
      <div style={{color:'#4444aa'}}>{this.printName()}</div>
      {this.props.appState.points[this.props.appState.selectedObject].map(x=><div>{x}</div>)}
      </div>
    :null}
      </div>
    )
  }
}

class ThreeView extends Component {
  constructor() {
    super()
    this.tc = new ThreeCanvas()
    console.log('tc',this.tc)
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
      <div>
      <div style={{zIndex:7}}>
      {/*// <FormDialog />*/}
      </div>
      <div id='2' style={{height: "100%",
                  // display:"inline",
                  position: "fixed",
                  top:0,
                  left:0,
                  width:"10%",
                  color:"0xffffff",
                  backgroundColor: "rgba(0,100,0,0.4)",
                  border:'1px solid #44ffff',
                  opacity:"1",
                  // textAlign: 'center',
                  // verticalAlign: 'middle',
                  // lineHeight: '40px'
                              }} >
                              <DataView appState={appState}/>
                              </div>

                              <FormDialog
                              appState={appState}
                              classes={styles}
                              handleOK={this.tc.confirmMark}
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
                                                                              }} >
                                                                              </div>
                                                      </div>
    )
  }
}

export default ThreeView
