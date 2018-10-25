import React, { Component } from 'react'
import * as d3 from 'd3'
import randomColor from 'randomcolor'

import '!style-loader!css-loader!./MainView.css'

const createArray = (dim, def) => d3.range(dim).map(() => def)

export default class D3View extends Component {

  groups={}
  framesPrev=[]

  // reInitD3(initVal) {
  // }

  tick(frameData) {
    this.now = new Date()

    // Object.entries(frameData).forEach(x=>{
    //   if(!this.groups.hasOwnProperty(x[0])){
    //     let r = new Object()
    //     r.color = '#ff0000'
    //     r.data = createArray(this.limit, Math.random()*50)//initVal)
    //     r.path = this.paths
    //       .append('path')
    //       .data([r.data])
    //       .attr('class', x[0] + ' group')
    //       .style('fill', 'none')
    //       .style('stroke', r.color)
    //
    //     this.groups[x[0]] = r
    //   }
    //     let r=this.groups[x[0]]
    //     r.data.push(x[1])
    //     // console.log(x)
    //     r.path.attr('d', this.line)
    // })


    for(let i=0;i<frameData.length;i++){
      if(frameData[i] == undefined)
        frameData[i]=this.framesPrev[i] || 0
      let x=[i,frameData[i]]

      if(!this.groups.hasOwnProperty(x[0])){
        let r = new Object()
        r.color = randomColor()//'#ff0000'
        r.data = createArray(this.limit, Math.random()*50)//initVal)
        r.path = this.paths
          .append('path')
          .data([r.data])
          .attr('class', x[0] + ' group')
          .style('fill', 'none')
          .style('stroke', r.color)

        this.groups[x[0]] = r
      }
        let r=this.groups[x[0]]
        r.data.push(x[1])
        // console.log(x)
        r.path.attr('d', this.line)

        this.framesPrev[i]=frameData[i]
      }

    // Shift domain
    this.x.domain([this.now - (this.limit - 2) * this.duration, this.now - this.duration])

    // Slide x-axis left
    this.axis
      .transition()
      .duration(this.duration)
      // .ease(d3.curveBasis)
      .call(this.x.axis)

    // Slide paths left
    this.paths
      .attr('transform', null)
      .transition()
      .duration(this.duration)
      // .ease(d3.curveBasis)
      .attr('transform', 'translate(' + this.x(this.now - (this.limit - 1) * this.duration) + ')')
    //  .on('end', tick)

    // Remove oldest data point from each group
    for (var name in this.groups) {
      var group = this.groups[name]
      group.data.shift()
    }

    this.y = d3
      .scaleLinear()
      .domain([0, 100*Math.random()])
      .range([this.height, 0])

  }



  componentDidMount() {
    let ds=d3.select(this.props.name)
    console.log('cDM',ds)

    this.limit = 60 * 1
        this.duration = 750
        this.now = new Date(Date.now() - this.duration)
      this.width = 900
        this.height = 400

      this.x = d3
        .scaleTime()
        .domain([this.now - (this.limit - 2), this.now - this.duration])
        .range([0, this.width])

      this.y = d3
        .scaleLinear()
        .domain([0, 100])
        .range([this.height, 0])

      this.line = d3
        .line()
        // .curve(d3.curveBasis)
        .x((d, i)=> {
          return this.x(this.now - (this.limit - 1 - i) * this.duration)
        })
        .y((d)=> {
          return this.y(d)
        })
        // console.log(this.props.name)

      this.svg = d3
      .select('.'+this.props.name)
        // .select('.d3view')
        .append('svg')
        .attr('class', 'chart')
        .attr('width', this.width)
        .attr('height', this.height + 50)

      this.axis = this.svg
        .append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0,' + this.height + ')')
        .call((this.x.axis = d3.axisBottom().scale(this.x))) //.orient('bottom'))

       this.paths = this.svg.append('g')

      // setInterval(tick, 500)
//    this.reInitD3(this.props.initVal)
  }

  update(data){
    // console.log(data)
    this.tick(data)//this.props.data)
  }

  componentDidUpdate(prevProps) {
    // console.log('cDU',this.props.data)//,this.props.name)
    // this.tick(this.props.data)
//    if (prevProps.initVal !== this.props.initVal) {
//      reInitD3(this.props.initVal)
  //  }
  }

  render() {
    return (
      <div>
        <div>{this.props.name}</div>
        {/*<div id="graph2" />*/}
        {/*<div className='d3view' />*/}
        <div className={this.props.name} />
      </div>
    )
  }
}
