//Main component
import React, { Component } from 'react'
import ReactJson from 'react-json-view'
import { Div } from 'glamorous'
import _ from 'lodash'

import { observable, when } from 'mobx'
import { observer } from 'mobx-react'

import Worker from 'worker-loader!../socket.worker'

// import MapView from './MapView'
import MsgConfig from './MsgConfigWebWorker'

import D3View from './D3ViewClass2'
import MsgViewMultiple from './MsgViewMultiple'
import ThreeView from './ThreeView'
import LegendsBlock from './LegendsBlock'
import parms from '../parms'

const refsMap = {}
const stakesInLine = 20,
  stepLong = 30,
  leftStakeLat = 4,
  stakeLat = 2,
  stakeLong = 2

const createRef = uuid => {
  let obj = new Object()
  let ref = React.createRef()
  obj.ref = ref
  refsMap[uuid] = obj
  return ref
}

var worker

//const LcreateStakesLine=(lat)=>Array.from({length:stakesInLine}).map((k,i)=>Array.of(lat,i*stepLong,lat+stakeLat,i*stepLong+stakeLong))

const createStakesLine = lat =>
  Array.from({ length: stakesInLine }).map((k, i) =>
    Array.of(lat, i * stepLong, stakeLat, stakeLong)
  )

//const c2=Array.from({length:5}).map((x,i)=>[i,i,i,i,i])
//console.log('tstc2',c2)

const stLineL = createStakesLine(5)
const stLineR = createStakesLine(-3)
//console.log('stLineL',stLineL)
const stakes = stLineL.concat(stLineR)
//console.log('stakes',stakes)

var // pathPos = 0,
gPos = 0

const updateRefValue = data => {
  data.forEach((x, i) => {
    Object.entries(x[1]).forEach((z, k) => {
      z[1].forEach(e => {
        let item = refsMap[e.uuid]
        let ref = item.ref
        ref.current.innerHTML = e.value
        //ref.current.style.backgroundColor='#444444'
      })
    })
  })
}

var gScale = 2,
  resX,
  resY

const reScaleGraph = newScale => {
  resX = ((parms.canvas.width / parms.realDims.width) * newScale) / 2
  resY = (parms.canvas.height / parms.realDims.height) * newScale
}

var ref2G = React.createRef()
var ref3d = React.createRef()
var ref3d2 = React.createRef()

reScaleGraph(gScale)

const offsX = parms.canvas.width / 2
const offsY = parms.canvas.height // 2
const allRefs = {}
const gRefC = React.createRef()
const rRef = React.createRef()

const drawGrid = (ctx, width, height, stepsW, stepsH) => {
  let c = gRefC.current
  let dW = width / stepsW
  let dH = height / stepsH

  ctx.lineWidth = 1
  ctx.fillStyle = '#000000'

  for (let i = 1; i < stepsW; i++) {
    ctx.beginPath()
    ctx.strokeStyle = i == (stepsW / 2).toFixed(0) ? '#222222' : '#dddddd'
    ctx.moveTo(dW * i, 0)
    ctx.lineTo(dW * i, height)
    ctx.stroke()
    ctx.fillText(((-dW * i + offsX) / resX).toFixed(2), dW * i, offsY - 5)
  }
  for (let i = 1; i < stepsH; i++) {
    ctx.beginPath()
    ctx.strokeStyle = i == stepsH.toFixed(0) ? '#222222' : '#dddddd'
    ctx.moveTo(0, dH * i)
    ctx.lineTo(width, dH * i)
    ctx.stroke()
    ctx.fillText(((-dH * i + offsY) / resY).toFixed(2), 5, dH * i)
  }
  ctx.beginPath()
  ctx.strokeStyle = '#333333'
  ctx.rect(0, 0, c.width, c.height)
  ctx.stroke()
}

const drawRect = (ctx, x, y, w, h, colorId) => {
  // console.log(objColors,colorId)
  ctx.beginPath()
  ctx.strokeStyle = objColors[colorId]
  let ltx = x - w / 2.0
  let lty = y - h //2.0
  let csWSize = w * 0.75
  let csHSize = h * 0.175
  // ctx.strokeStyle = '#444444'
  ctx.rect(ltx, lty, w, h)
  // ctx.fillStyle = objColors[colorId] //'#fff2ac'
  // ctx.fillRect(ltx, lty, w, h)
  // ctx.stroke()
  // ctx.moveTo(x - csWSize, y)
  // ctx.lineTo(x + csWSize, y)
  ctx.moveTo(x, y - csHSize)
  ctx.lineTo(x, y + csHSize)
  ctx.lineWidth = 2
  // ctx.strokeStyle=colorId
  ctx.stroke()
}

const drawRectOnMap = (
  ctx,
  x,
  y,
  w,
  h,
  colorId,
  title = false,
  name = 'area'
) => {
  let mx = -1 * (x * resX) + offsX
  let my = -1.0 * (y * resY) + offsY
  let mw = w * resX
  let mh = h * resY
  // console.log('onMap',x,y,mx,my,mw,mh)
  ctx.beginPath()
  ctx.lineWidth = 1
  ctx.rect(mx, my - mh, mw, mh)
  ctx.strokeStyle = '#333333' //objColors[colorId] //'#fff2ac'
  ctx.fillStyle = objColors[colorId] //'#fff2ac'
  ctx.fillRect(mx, my - mh, mw, mh)
  ctx.stroke()
  if (title) {
    // console.log('title true!')
    ctx.fillStyle = '#000000'

    ctx.fillText(
      x.toFixed(2) + ' ' + (y + gPos).toFixed(2) + ' ' + w + ' ' + h,
      mx,
      my
    )
  }
  if (name) {
    // console.log('name true!')
    ctx.fillStyle = '#000000'

    ctx.fillText(name, mx, my - 10)
  }
}

var stakesZ = []
//let stObst=

var dangerCnt = 0

var lblOffsX = 0,
  lblOffsY = 0

const reDrawGraphObjs = (data, state) => {
  let c = gRefC.current
  var ctx = gRefC.current.getContext('2d')
  ctx.font = '14px Arial'
  ctx.clearRect(1, 1, c.width - 2, c.height - 2)
  // ctx.beginPath()
  drawRectOnMap(ctx, 5, 0, 10, 200, 'warningArea')
  drawRectOnMap(ctx, 2.5, 0, 5, 20, 'checkArea')

  drawGrid(ctx, parms.canvas.width, parms.canvas.height, 10, 5)
  // stakes.forEach(st=>drawRectOnMap(ctx,st[0],st[1]-pathPos,st[2],st[3],'stakeArea'))
  // if(stakesZ)
  stakesZ.forEach(st => {
    //console.log(st);
    // console.log(st)
    // drawRectOnMap(ctx,st.left,st.top-gPos,st.width,st.height,'stakeArea',true)})
    drawRectOnMap(
      ctx,
      st.left,
      st.top - gPos,
      st.left - st.right,
      st.top - st.bottom,
      'stakeArea',
      true,
      // aa:4,
      st.name
    )
  })
  // ctx.stroke()

  // pathPos+=1
  // pathPos &= 0x1ff

  //  stakes.forEach(st=>drawRectOnMap(ctx,st[0],st[1],st[2],st[3],'stakeArea'))

  let rad = 1 * gScale
  let csSize = rad * 1.5
  lblOffsX = 1 //csSize
  lblOffsY = 0

  // ctx.strokeStyle = '#ff0000'

  let dangerFixed = false

  Object.values(data).forEach(t => {
    let colorId = 'dangerArea'

    let drWidth = t.Object_Width || 1
    let drLength = t.Object_Length || 1

    let str = t.Object_ID + ' ' + t.Object_DistLong + ' ' + t.Object_DistLat
    // // let str = t.rcs
    let x = -1 * (t.Object_DistLat * resX) + offsX
    let y = -1.0 * (t.Object_DistLong * resY) + offsY
    drawRect(ctx, x, y, drWidth * resX, drLength * resY, t.colorId)

    ctx.fillStyle = '#000000'
    if (state.config.Labels)
      ctx.fillText(str, x + (lblOffsX * resX) / 2, y - (lblOffsY * resY) / 2)
    // console.log('rdgo',t.Object_ID,t.Object_DistLat,t.Object_DistLong,x,y)
  })
}

const maxScale = 0.6

class Graph extends Component {
  handleOnWheel = e => {
    gScale -= e.deltaY * 0.1
    if (gScale < maxScale) gScale = maxScale
    reScaleGraph(gScale)
    e.preventDefault()
  }

  render() {
    return (
      <div>
        <canvas
          ref={gRefC}
          width={parms.canvas.width}
          height={parms.canvas.height}
          onWheel={this.handleOnWheel}
        />
      </div>
    )
  }
}

const randomColor = () =>
  '#' + Math.floor(Math.random() * 16777215).toString(16)

const objClassChecks = [
  'point',
  'car',
  'truck',
  'pedestrian',
  'motorcycle',
  'bicycle',
  'wide',
  'reserved'
]
const objColors = {}
objClassChecks.forEach(x => (objColors[x] = randomColor()))
objColors['warningArea'] = '#ffffaa'
objColors['objColor'] = '#444422'
objColors['checkArea'] = '#ffdddd'
objColors['stakeArea'] = '#ddffdd'
objColors['greenArea'] = '#00ff00'
objColors['dangerArea'] = '#ff0000'

@observer
class CanApp extends Component {
  constructor(props) {
    super(props)
    this.gRef = React.createRef()
  }

  @observable objParmsRedefined = 0

  state = {
    config: {}
  }

  objParms = {}

  checks = ['Config', 'Data', 'Table', 'Graph', 'Map', 'Labels', 'Log']

  handleInputChange = e => {
    let config = this.state.config
    config[e.target.name] =
      e.target.type === 'checkbox' ? e.target.checked : e.target.value
    this.setState({ config })
  }

  createChecks = (checkSet, colors) => {
    console.log('createChecks', this.state, colors)
    return this.state != null ? (
      <Div display="flex">
        Show:&nbsp;
        {checkSet.map((x, i) => (
          <Div key={i} border="1px solid #cccccc">
            <label>
              <Div
                border="1px solid #cccccc"
                display="flex"
                flexDirection="row"
                alignItems="center"
                textAlign="center">
                <input
                  name={x}
                  checked={this.state.config[x]}
                  type="checkbox"
                  onChange={this.handleInputChange}
                />
                {colors ? (
                  <Div
                    width="16px"
                    height="16px"
                    border="1px solid #222222"
                    borderRadius="4px"
                    backgroundColor={colors[x]}
                  />
                ) : null}
                <Div padding="0 10px 0 5px">{x}</Div>
              </Div>
            </label>
          </Div>
        ))}
      </Div>
    ) : null
  }

  createRefs = msgPack => {
    msgPack.forEach(msg => {
      msg.signals.forEach(signal => {
        signal.values.forEach(item => {
          item.ref = React.createRef()
          allRefs[item.uuid] = item.ref
        })
      })
    })
    console.log(allRefs)
  }

  componentDidMount() {
    objClassChecks.forEach(x => (this.state.config[x] = true))

    this.w = new Worker()
    worker = this.w

    this.w.postMessage({ id: 'location', payload: window.location.origin })
    console.log('CanApp2 didMount')
    this.w.onmessage = event => {
      let { id, payload } = event.data

      // console.log('received:',id,payload)

      // if (id === 'signalsCnt') {
      //   signalsCntRef.current.innerHTML = payload
      // }

      if (id == 'canBusDef') {
        this.setState({ canBusDef: payload })
        //        ref2G.current.redraw()
      }

      if (id == 'configOptions') {
        this.setState({ configOptions: payload })
      }

      if (id == 'appConfig') {
        this.setState({ appConfig: payload })
        // reCountStakes(payload.stakes)
        //console.log('')
      }

      if (id == 'blankAreas') {
        // this.setState({ appConfig: payload })
        stakesZ = payload
        console.log('stakes', stakesZ)
      }

      if (id == 'logList') {
        this.setState({ logList: payload })
      }

      if (id == 'updateTables') {
        ;[payload.singleMsg, payload.objPack, payload.clustPack].forEach(x =>
          this.createRefs(x)
        )
        this.setState({ groupedMsg: payload })
      }

      // if (id == 'updateSignals') {
      //   payload.forEach(x => {
      //     let ref = allRefs[x.uuid]
      //     if (ref && ref.current) {
      //       ref.current.innerHTML = x.value
      //     }
      //   })
      // }

      // if (id == 'objPack') {
      //   if (payload.extend) {
      //     this.setState({ objPack: payload.data })
      //   } else {
      //     updateRefValue(payload.data)
      //   }
      // }
      //
      // if (id == 'clustPack') {
      //   if (payload.extend) {
      //     this.setState({ clustPack: payload.data })
      //   } else {
      //     updateRefValue(payload.data)
      //   }
      // }

      if (id === 'updateGraph') {
        reDrawGraph(payload, this.state)
        //        ref2G.current.redraw()
      }

      if (id === 'updateGraphObjs') {
        // reDrawGraphObjs(payload.objsFrame, this.state)
        // if(!this.state.rObjectDef){
        //   // console.log('msg',payload.objsFrame)
        let updated = false

        Object.entries(payload.objsFrame).forEach(x => {
          // console.log(x[0],x[1])
          Object.entries(x[1]).forEach(o => {
            // console.log(o)
            if (!this.objParms.hasOwnProperty(o[0])) {
              this.objParms[o[0]] = new Object()
              this.objParms[o[0]]['data'] = []
              this.objParms[o[0]]['ref'] = React.createRef()
              // this.objParmsRedefined+=1
              // console.log('in Cycle',this.objParmsRedefined)
              updated = true
            }
            this.objParms[o[0]]['data'][x[0]] = o[1]
          })
        })

        when(
          () => updated,
          () => {
            console.log('objRedef', this.objParms)
            this.objParmsRedefined += 1
          }
        )
        // }
        // if(!this.state.hasOwnProperty(objParms)){
        //   // this.setState(objParms:this,objParms)
        //   console.log(this.objParms)
        // }

        // console.log(this.objParms)

        Object.entries(this.objParms).forEach(e => {
          //console.log(e[0])}

          // console.log('view', parms.viewable.filter(v => e[0].includes(v)))

          if (parms.viewable.filter(v => e[0].includes(v)).length)
            e[1].ref.current.update(e[1].data)
        })

        ref3d.current.tc.update(payload)
        ref3d2.current.tc.update(payload)
        //        ref2G.current.redraw()
      }

      if (id === 'gPos') {
        //gPos = payload
        //rRef.current.innerHTML = gPos.toFixed(3)
        // console.log('gPos upd', gPos)
      }
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    // if(!_.isEqual(nextState.config,this.state.config))
    // console.log('scupd',nextState.config.Log,this.state.config.Log)
    // console.log('scupd',nextState.config,_.isEqual(nextState.config,this.state.config))
    // if(this.state )
    return true
  }

  componentDidUpdate() {
    this.w.postMessage({ id: 'mainStateConfig', payload: this.state.config })
    console.log('state sended!')
  }

  handleOnEditJSON = obj => {
    this.w.postMessage({ id: 'appConfigFieldChanged', payload: obj })
    reDrawGraph([], this.state)
    // console.log(obj);
    return true
  }

  render() {
    console.log('objParmsRedefined', this.objParmsRedefined)
    // console.log('canApp2 render',this.state)

    //     return this.state && this.state.appConfig  ?(
    //     // use the component in your app!
    // ):null

    // if(this.state && this.state.objParms)
    // {
    //   console.log('objParm',state)
    // }

    return(
      <div>
      <ThreeView ref={ref3d} mountId="main-id-1" />
      </div>
    )



    return this.state && this.state.canBusDef ? ( // && this.state.groupedMsg ? (
      <Div fontSize="small">
        <Div display="flex">{this.createChecks(this.checks)}</Div>
        <ThreeView ref={ref3d} mountId="main-id-1" />
        <ThreeView ref={ref3d2} mountId="main-id-2" />
        {this.state.config.Map ? (
          <MapView ref={ref2G} logList={this.state.logList} worker={this.w} />
        ) : null}

        {/*{this.arr.map((x,i)=><D3View ref={x} key={i} name={'u'+uuidv1()} data={this.state.sData} initVal={10}/>)}*/}
        {this.objParms
          ? Object.entries(this.objParms).map((x, i) => {
            return (parms.viewable.filter(v=>x[0].includes(v)).length ?
              <D3View ref={x[1].ref} key={i} name={x[0]} initVal={10} />
            : null)})
          : null}

        {/*{this.state.objParms?<div>'define!'</div>:null}*/}

        {/*<div ref={signalsCntRef}>0</div>*/}

        {this.state.config.Config ? (
          <Div display="flex" flexWrap="wrap" justifyContent="center">
            {this.state.groupedMsg.cfgMsg.map((x, k) => (
              <MsgConfig
                key={k}
                msgCan={x}
                worker={this.w}
                configOptions={this.state.configOptions}
              />
            ))}
          </Div>
        ) : null}

        {this.state.config.Graph ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'row'
            }}>
            <div>
              <Graph />
              {this.createChecks(objClassChecks, objColors)}
            </div>
            <div>
              <div style={{ display: 'flex' }}>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    margin: '8px 4px'
                  }}>
                  Path position &nbsp;
                  <div ref={rRef}>draw</div>
                </div>
              </div>
              <div style={{ margin: '8px 4px' }}>
                <LegendsBlock legends={parms.legends} />
              </div>
              <div style={{ margin: '8px 4px' }}>
                <ReactJson
                  src={this.state.appConfig}
                  onEdit={this.handleOnEditJSON}
                />
              </div>
            </div>
          </div>
        ) : null}

        {this.state.config.Table ? (
          <Div display="flex" flexDirection="column">
            {this.state.groupedMsg.objPack.map((x, k) => (
              <MsgViewMultiple key={k} msgCan={x} />
            ))}
            {this.state.groupedMsg.clustPack.map((x, k) => (
              <MsgViewMultiple key={k} msgCan={x} />
            ))}
          </Div>
        ) : null}

        {this.state.config.Data ? (
          <Div display="flex">
            {this.state.groupedMsg.singleMsg.map((x, k) => (
              <MsgViewMultiple key={k} msgCan={x} />
            ))}
          </Div>
        ) : null}
      </Div>
    ) : (
      <div>Waiting for connection...</div>
    )
  }
}

export default CanApp
