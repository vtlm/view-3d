//Web worker for socket.io
import React from 'react'
import openSocket from 'socket.io-client'
import uuidv1 from 'uuid'
import parms from './parms'

var curr_ID = 0
var extend = false
var viewSignals = null
var objClass = null
var gPos, gPosPrev

const parseCanBusDef = canBusDef => {
  let objClassMsg = canBusDef.find(x => x.name === 'Object_3_Extended')
  let objClassSignal = objClassMsg.signals.find(x => x.name === 'Object_Class')
  objClass = objClassSignal.labels

  self.allSignals = []
  canBusDef.forEach(x => {
    let msgSignals = []
    self.allSignals[x.name] = msgSignals
    x.signals.forEach(z => {
      msgSignals[z.name] = []
    })
  })

  canBusDef.forEach(message => {
    message.signals.forEach(signal => {
      signal.values = []
    })
  })

  let cfgMsg = canBusDef.filter(x =>
    parms.canMsgWriteId.find(t => x.id.toString(16).includes(t))
  )
  let singleMsg = canBusDef.filter(x => parms.singleInfoMsgs.includes(x.name))

  self.groupedMsg = {
    radarState: canBusDef.filter(x => x.name.includes('RadarState')),
    cfgMsg: cfgMsg,
    singleMsg: singleMsg,
    objPack: canBusDef.filter(
      x => x.name.includes('Object') && !x.name.includes('Status')
    ),
    clustPack: canBusDef.filter(
      x => x.name.includes('Cluster') && !x.name.includes('Status')
    )
  }
  viewSignals = [
    self.groupedMsg.singleMsg,
    self.groupedMsg.objPack,
    self.groupedMsg.clustPack
  ]
}

const getAllChangedSignals = () => {
  let signals = []

  const getChangedSignals = msgsPack => {
    msgsPack.forEach(msg => {
      msg.signals.forEach(signal => {
        signal.values.forEach(item => {
          if (item.updated) {
            signals.push({ uuid: item.uuid, value: item.value })
            item.updated = false
          } else {
            item.notUpdatedCycles += 1
          }
        })
      })
    })
  }

  viewSignals.forEach(x => getChangedSignals(x))

  return signals
}

const updateGraph = () => {
  {
    let data = []
    let arrLat = null
    let arrLong = null
    let vRelLong = null
    let arrRCS = null
    let arrWidth = null
    let arrLength = null
    let arrID = null
    let arrProbExist = null
    let arrObjClass = null
    //objects
    if (self.outputType == 1) {
      arrLat = self.allSignals['Object_1_General']['Object_DistLat']
      arrLong = self.allSignals['Object_1_General']['Object_DistLong']
      vRelLong = self.allSignals['Object_1_General']['Object_VrelLong']
      arrProbExist = self.allSignals['Object_2_Quality']['Obj_ProbOfExist']
      vRelLong = self.allSignals['Object_1_General']['Object_VrelLong']
      arrRCS = self.allSignals['Object_1_General']['Object_RCS']
      arrWidth = self.allSignals['Object_3_Extended']['Object_Width']
      arrLength = self.allSignals['Object_3_Extended']['Object_Length']
      arrID = self.allSignals['Object_1_General']['Object_ID']
      arrObjClass = self.allSignals['Object_3_Extended']['Object_Class']

      let l = arrLat.length
      for (let i = 0; i < l; i++) {
        if (arrLat[i] && arrLat[i].updated) {
          // console.log(arrLat[i],parseFloat(arrLat[i]))
          arrLat[i].updated = false
          let classId = objClass[arrObjClass[i].value]
          if (mainStateConfig.hasOwnProperty(classId)) {
            if (mainStateConfig[classId]) {
              // console.log(classId)
              data.push({
                x: parseFloat(arrLat[i].value),
                y: parseFloat(arrLong[i].value),
                vRelLong: parseFloat(vRelLong[i].value),
                probExist: parseFloat(arrProbExist[i].value),
                rcs: parseFloat(arrRCS[i].value),
                width: parseFloat(arrWidth[i].value),
                length: parseFloat(arrLength[i].value),
                id: arrID[i],
                classId: classId
              })
            }
          }
        }
      }
    }
    //clusters
    if (self.outputType == 2) {
      arrLat = self.allSignals['Cluster_1_General']['Cluster_DistLat']
      arrLong = self.allSignals['Cluster_1_General']['Cluster_DistLong']
      arrID = self.allSignals['Cluster_1_General']['Cluster_ID']

      let l = arrLat.length
      for (let i = 0; i < l; i++) {
        if (arrLat[i] && arrLat[i].updated) {
          // console.log(arrLat[i],parseFloat(arrLat[i]))
          arrLat[i].updated = false
          data.push({
            x: parseFloat(arrLat[i].value),
            y: parseFloat(arrLong[i].value),
            id: arrID[i]
          })
        }
      }
    }
    self.postMessage({ id: 'updateGraph', payload: data })
  }
}

const signalValueUpdate = msg => {
  let { message, signal, value } = msg
  // console.log(msg)

  if (signal == 'RadarState_OutputTypeCfg') {
    self.outputType = value
    let cSignals = getAllChangedSignals()
    if (extend) {
      self.postMessage({ id: 'updateTables', payload: self.groupedMsg })
      extend = false
    }
    self.postMessage({ id: 'updateSignals', payload: cSignals })
  }

  if (signal.includes('_ID')) {
    curr_ID = value
  }

  if (parms.singleInfoMsgs.includes(message)) curr_ID = 0

  let cMsg = self.canBusDef.find(x => x.name == message)
  let cSignal = cMsg.signals.find(x => x.name == signal)

  let enc = Object.keys(cSignal.labels).length
    ? `-${cSignal.labels[value]}`
    : ''

  let value1 = value + enc //.slice(0, 8)

  if (cSignal.values[curr_ID] === undefined) {
    cSignal.values[curr_ID] = {
      value: value1,
      uuid: uuidv1(),
      updated: true
    }
    extend = true
  } else {
    cSignal.values[curr_ID].value = value1
    cSignal.values[curr_ID].updated = true
  }

  if (self.allSignals[message][signal][curr_ID] === undefined) {
    self.allSignals[message][signal][curr_ID] = {
      value: value,
      uuid: uuidv1()
    }
    extend = true
  } else {
    // console.log('sign upd',message,signal,value)
    self.allSignals[message][signal][curr_ID].value = value
    self.allSignals[message][signal][curr_ID].updated = true
  }

  if (self.mainStateConfig && self.mainStateConfig.Table) {
    if (
      signal.includes('Object_NofObjects') ||
      signal.includes('Cluster_NofClustersNear')
    ) {
      let cSignals = getAllChangedSignals()
      self.postMessage({ id: 'updateSignals', payload: cSignals })
    }
  }

  if (
    self.mainStateConfig &&
    self.mainStateConfig.Graph &&
    self.outputType &&
    (signal.includes('Object_NofObjects') ||
      signal.includes('Cluster_NofClustersNear'))
  )
    updateGraph()
}

/*
connection with main thread
*/
self.addEventListener('message', event => {
  let { id, payload } = event.data
  console.log(event)
  if (id === 'location') {
    console.log('host:', payload)

    // self.socket = openSocket('http://10.10.220.80:8000')
    // self.socket = openSocket('http://10.10.227.23:8000')
    // self.socket = openSocket(payload)
    self.socket = openSocket('http://localhost:8000')
    console.log('socket opened:', self.socket)

    self.socket.on('canBusDef', canBusDef => {
      console.log('canBusDef', canBusDef)
      self.canBusDef = canBusDef
      parseCanBusDef(canBusDef)
      console.log('allSignals', self.allSignals)
      self.postMessage({ id: 'canBusDef', payload: canBusDef })
      self.postMessage({ id: 'objClass', payload: objClass })
    })

    self.socket.on('configOptions', configOptions => {
      self.postMessage({ id: 'configOptions', payload: configOptions })
    })

    self.socket.on('appConfig', configOptions => {
      self.postMessage({ id: 'appConfig', payload: configOptions })
    })

    self.socket.on('blankAreas', data => {
      self.postMessage({ id: 'blankAreas', payload: data })
    })

    self.socket.on('radarFrame', msg => {
      // console.log('rdrFrame',msg)
      // console.log(msg.mbVars,msg.msw)
      self.postMessage({ id: 'updateGraphObjs', payload: msg })
      self.postMessage({ id: 'gPos', payload: msg.mbVars.position.val })
      // self.postMessage({ id: 'updateGraphObjs', payload: msg.objs })
    })

    self.socket.on('detectFrame',msg=>{
      console.log('detectFrame')
    })

    self.socket.on('logList', msg => {
      console.log('logList', msg)
      self.postMessage({ id: 'logList', payload: msg })
    })
    self.socket.on('canSignalUpdate', msg => signalValueUpdate(msg)) //this.signalValueUpdate(msg))

    self.socket.on('canMessage', msg => {
      // let {message,signals,pos} = msg
      let { pos } = msg
      if (pos != gPos) {
        console.log('pos=', pos)
        gPos = pos
        self.postMessage({ id: 'gPos', payload: pos })
      }
      // console.log('msg,signals',msg,signals)
      // Object.entries(signals).forEach(([k, v]) =>
      //   signalValueUpdate({ message: message, signal: k, value: v })
      // )
    })
  }

  if (id === 'mainStateConfig') {
    self.mainStateConfig = payload
    self.socket.emit(id, payload)
    console.log('Config changed', id, payload)
  }

  if (id === 'rideCtl') {
    console.log('WW ', id, payload)
    self.socket.emit(id, payload)
  }

  if (id === 'appConfigFieldChanged') {
    self.socket.emit(id, payload)
    console.log('appConfig changed', id, payload)
  }

  if (id === 'sendToCan') {
    self.socket.emit(payload.id, payload.payload)
  }
})
