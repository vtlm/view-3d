import React, { Component } from 'react'
// import uuidv1 from 'uuid'
// import CanApp from './CanApp2'

// import * as d3 from "d3";
import ThreeView from './ThreeView'


import './MainView.css'

import D3View from './D3ViewClass2'
// import LegendsBlock from './LegendsBlock'
// import RectColorLegend from './RectColorLegend'
// import parms from '../parms'
// const width=800,height=200


let d3ref1=React.createRef()
let ref3d=React.createRef()

export default class MainView extends Component {

  state={}
  // static getDerivedStateFromProps()
  arr=Array.from({length:6},(x,i)=>{return React.createRef()})

  // setInterval(this.updateView,500)
  componentDidMount(){
    // console.log('cdm',this)
  }

  updateView(){
    // let dta=this.updateDataR(54,15)
    // this.setState({sData:dta})
    // console.log('dat',dta)

    console.log('UPDr')//,this.updateDataR(54,15))
    // this.arr.forEach(x=>x.current.update(this.updateDataR(54,15)))

  }

  updateArrayData(size){
    let obj={}
    for(let i=0;i<size;i++){
      obj[i]=Math.random()
    }
    return obj
  }

  updateData(nChan,length){
    let dData={}
    for(let i=0;i<nChan;i++){
      dData[i]=Math.random()*20//this.updateArrayData(length)
    }
    return dData
  }

  updateDataR(nChan,length){
    let dData=[]
    for(let i=0;i<nChan;i++){
      if(Math.random()>0.5)
        dData[i]=Math.random()*20//this.updateArrayData(length)
    }
    // console.log(dData)
    // let s=Object.entries(dData).map(x=>x)
    // console.log(s)
    // dData.forEach(x=>console.log(x))
    // for(let i=0;i<dData.length;i++)
      // console.log(dData[i])
    return dData
  }


  render() {
    console.log('render mainView',this)
    // if(this.state)
    // console.log('rend',this.state.sData)

    return (
      <div>


        <div
          id="main-id"

          style={{
            // border: '1px solid #ff0000',
            display: 'flex',
            width: '100vw',
            height: '100vh'
          }}>
          <div
            id="main-id-1"
            style={{
              position:'relative',
              // border: '1px solid #ff0000',
              width: '100%',
              height: '100%'
            }}
            onMouseLeave={(e)=>{console.log('Leave MV',e)}}
          />

          {/*<div
            id="main-id-2"
            style={{
              position:'relative',
              border: '1px solid #ff0000',
              width: '50vw',
              height: '100%'
            }}
          />
          */}
        </div>

          <ThreeView ref={ref3d} mountId="main-id-1" />
      </div>
    )
  }
}
