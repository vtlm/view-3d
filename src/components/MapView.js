import React,{Component} from 'react'
import clustering from 'density-clustering'
import parms from '../parms'
import {drawRect, drawGrid} from '../canvas-graph'
const  rectBoundColor='#ff0000',rectFillColor='#ffffdd',markFillColor='#666666',markRad=3


var gRefC=React.createRef()
var gRefCont=React.createRef()
let numClust=60,numPts=20,widthRange=1000,longRange=4000,offsX=600,offsY=0

const randomColor = () =>
      '#' + Math.floor(Math.random() * 16777215).toString(16)

const createCluster=(centrX,centrY,devX,devY)=>{
let c=    Array.from({length: numPts}, () => [centrX-devX+Math.random() * devX,
                                              centrY-devY+Math.random() * devY])
    // console.log('clustD',c)
   return c
}

let dataSetByClust=
    Array.from({length:numClust}, () =>
               createCluster(Math.random()*widthRange,Math.random()*longRange,100,100)
               // Array.from({length: numPts}, () => [Math.random() * widthRange, Math.random() * longRange])
              )
let dataSet=[].concat.apply([],dataSetByClust)
console.log('dataSet',dataSet)

// var dataSet = [
//     [1,1],[0,1],[1,0],
//     [10,10],[10,13],[13,13],
//     [54,54],[55,55],[89,89],[57,55]
// ];
let dbscan=new clustering.DBSCAN()
let clusters=dbscan.run(dataSet,40,8)
// console.log('clustS',clusters,dbscan)

const drawCluster=(dataSet,clusterInd,ctx)=>{
    // ctx.strokeStyle=randomColor();
    // ctx.fillStyle='#aaaa00'
    // clusterInd.forEach(d=>{ctx.beginPath();
    //                        ctx.arc(dataSet[d][0],dataSet[d][1],markRad,0,2*Math.PI);
    //                        ctx.fill()
                           // ctx.stroke()})
    let xs=clusterInd.map(d=>dataSet[d][0])
    let ys=clusterInd.map(d=>dataSet[d][1])
    let minX=Math.min.apply(null,xs)
    let maxX=Math.max.apply(null,xs)
    let minY=Math.min.apply(null,ys)
    let maxY=Math.max.apply(null,ys)
    ctx.strokeStyle=rectBoundColor
    ctx.fillStyle=rectFillColor
    ctx.beginPath()
    ctx.rect(minX,minY,maxX-minX,maxY-minY)
    ctx.fill()
    ctx.stroke()

    ctx.strokeStyle=randomColor();
    ctx.fillStyle='#aaaa00'
    clusterInd.forEach(d=>{ctx.beginPath();
                           ctx.arc(dataSet[d][0],dataSet[d][1],markRad,0,2*Math.PI);
                           ctx.fill()
                           ctx.stroke()})
 }


export default class MapView extends Component{

    static getDerivedStateFromProps(props,state){
        if(!state){// || (state.logList != props.logList)){
            let logList={}
            props.logList.forEach(x=>{logList[x]=false})
            // console.log(logList)
            return{logList}
        }else{
            let logList=state.logList
            props.logList.forEach(x=>{if(!logList.hasOwnProperty(x))logList[x]=false})
            return{logList}
    }
    }

    componentDidMount(){
        console.log('mapView',gRefC)
        let ctx = gRefC.current.getContext('2d')
        clusters.forEach(c=>{drawCluster(dataSet,c,ctx)})
        // ctx.textAlign = 'center';
        // ctx.font = '15px Arial'
        // ctx.fillText('text3333',20,20)
        // ctx.beginPath();
        // ctx.moveTo(0,0);
        // ctx.lineTo(300,150);
        // dataSet.forEach(d=>{ctx.beginPath();ctx.arc(d[0],d[1],10,0,2*Math.PI);ctx.stroke()})
        // ctx.stroke();
        // dataSet.forEach(d=>ctx.rad(d[0],d[1],10,0,2*Math.PI))
        // for (let w = 0; w < gRefC.current.clientWidth; w += 100) {
        //     for (let h = 0; h < gRefC.current.clientHeight; h += 100) {
        //         ctx.fillText(w + ',' + h, w, h);
        //         // console.log(w,h)
        //     }
        // }
        drawGrid(ctx,1200,4800,20,20)
        gRefCont.current.scrollTop=3650

        // this.props.worker.onmessage=event=>{
        //     if(event.data.id === 'logList')
        //     console.log('msg',event.data)}
    }

    handleLoadClick=()=>{
        console.log('clicked!')
        let ldList=Object.entries(this.state.logList).filter(x=>x[1]).map(x=>x[0])
        console.log('ldList=',ldList)
        ldList.forEach(x=>{
                       var xhr=new XMLHttpRequest()
                       xhr.responseType='text'
            xhr.addEventListener('load',()=>{
                // console.log(xhr.responseText)
                console.log('xhr.responseText')
            })
                       xhr.withCredentials=true
                       xhr.open('GET',x,true)
                       // xhr.open('GET','http://localhost:8000/fileL',true)
                       xhr.send()
        })
   }

    handleInputChange=(e)=>{
        console.log(e.target.name,e.target.checked)
        let logList=this.state.logList
        logList[e.target.name]=e.target.checked
        console.log(logList)
        this.setState({logList})
    }

    render(){
        console.log(this.state)
        return(
                <div style={{display:'flex', alignSelf:'flex-start'}}>
                <div ref={gRefCont} style={{width:'1220px', height:'1000px', overflow:'auto', border:'1px solid'}}>
               <canvas ref={gRefC} height={4650.0} width={1200.0} style={{border:'1px solid'}}></canvas>
                </div>
                <div>
                {Object.keys(this.state.logList).map((x,i)=>
                                                     <div key={i}>
                                                     <label>{x}
                                                     <input
                                                     name={x}
                                                     type='checkbox'
                                                     checked={this.state.logList[x]}

                                                     onChange={this.handleInputChange}
                                                     />
                                                     </label>
                                                     </div>)}
                </div>
                <div>
                <button onClick={this.handleLoadClick}>Load</button>
                </div>
                <label>
                File Name
                <input type='text' />
                </label>
             <button >Save</button>
            </div>
        )
    }
}
