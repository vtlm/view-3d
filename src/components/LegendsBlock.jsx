import React, { Component } from 'react'
import RectColorLegend from './RectColorLegend'
import parms from '../parms'

export default class LegendsBlock extends Component {
  render() {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column'
        }}>
        {parms.legends.map(x => (
          <RectColorLegend name={x.name} color={x.color} />
        ))}
        {/*<RectColorLegend name={'danger'} color={'#ee6666'} />*/}
      </div>
    )
  }
}
