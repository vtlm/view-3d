import React, { Component } from 'react'
import * as d3 from 'd3'

import '!style-loader!css-loader!./MainView.css'

const createArray = (dim, def) => d3.range(dim).map(() => def)

export default class D3View extends Component {

  reInitD3(initVal) {
    var limit = 60 * 1,
      duration = 750,
      now = new Date(Date.now() - duration)

    var width = 900,
      height = 200

    var groups = {}

    var x = d3
      .scaleTime()
      .domain([now - (limit - 2), now - duration])
      .range([0, width])

    var y = d3
      .scaleLinear()
      .domain([0, 100])
      .range([height, 0])

    var line = d3
      .line()
      // .curve(d3.curveBasis)
      .x(function(d, i) {
        return x(now - (limit - 1 - i) * duration)
      })
      .y(function(d) {
        return y(d)
      })

    var svg = d3
      .select('.graph2')
      .append('svg')
      .attr('class', 'chart')
      .attr('width', width)
      .attr('height', height + 50)

    var axis = svg
      .append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0,' + height + ')')
      .call((x.axis = d3.axisBottom().scale(x))) //.orient('bottom'))

    var paths = svg.append('g')
}

  update(frameData) {
      now = new Date()

      Object.entries(frameData).forEach(x=>{
        if(!groups.hasOwnProperty(x[0])){
          let r = new Object()
          r.color = '#ff0000'
          r.data = createArray(limit, initVal)
          r.path = paths
            .append('path')
            .data([r.data])
            .attr('class', x[0] + ' group')
            .style('fill', 'none')
            .style('stroke', r.color)

          groups[x[0]] = r
        }
          let r=groups[x[0]]
          r.data.push[x[1]]
          r.path.attr('d', line)
      })

      // let i = Math.random()
      // if (i > 0.7) {
      //   let r = new Object()
      //   r.color = '#ff0000'
      //   r.data = createArray(limit, initVal)
      //   r.path = paths
      //     .append('path')
      //     .data([r.data])
      //     .attr('class', i + ' group')
      //     .style('fill', 'none')
      //     .style('stroke', r.color)
      //   groups[i] = r
      //   // console.log(r)
      // }

      // if (i < 0.3) {
      //   let gKeys = Object.keys(groups)
      //   console.log(gKeys.length)
      //   let ind = gKeys.length * Math.random()
      //   let i2 = ~~ind
      //   groups[gKeys[i2]].path.remove()
      //   delete groups[gKeys[i2]]
      //   // console.log(typeof(ind),typeof(i2),i2,gKeys[i2])
      //   // d3.select('#'+gKeys[i2]+' group').remove()
      // }

      // Object.values(groups).forEach(x=>console.log(x))

      // Add new values
      // for (var name in groups) {
      //   var group = groups[name]
      //   //group.data.push(group.value) // Real values arrive at irregular intervals
      //   group.data.push(0 + Math.random() * 100)
      //   group.path.attr('d', line)
      // }

      // Shift domain
      x.domain([now - (limit - 2) * duration, now - duration])

      // Slide x-axis left
      axis
        .transition()
        .duration(duration)
        // .ease(d3.curveBasis)
        .call(x.axis)

      // Slide paths left
      paths
        .attr('transform', null)
        .transition()
        .duration(duration)
        // .ease(d3.curveBasis)
        .attr('transform', 'translate(' + x(now - (limit - 1) * duration) + ')')
      //  .on('end', tick)

      // Remove oldest data point from each group
      for (var name in groups) {
        var group = groups[name]
        group.data.shift()
      }
    }



  componentDidMount() {
    this.reInitD3(this.props.initVal)
  }

  componentDidUpdate(prevProps) {
    if (prevProps.initVal !== this.props.initVal) {
  //    reInitD3(this.props.initVal)
    }
  }

  render() {
    return (
      <div>
        <div>{this.props.name}</div>
        {/*<div id="graph2" />*/}
        <div className={this.props.name} />
        {/*<div className="graph2" />*/}
      </div>
    )
  }
}
