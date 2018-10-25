import React, { Component } from 'react'

export default class RectColorLegend extends Component {
  render() {
    return (
      <div style={{display:'flex'}}>
      <div
        style={{
          width: '16px',
          height: '16px',
          border: '1px solid #222222',
          borderRadius: '4px',
          backgroundColor: this.props.color
        }} />
        <div>
        {this.props.name}
        </div>
    </div>
    )
  }
}
