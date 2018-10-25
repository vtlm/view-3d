//configuaration component
import React, { Component } from 'react'
import glamorous from 'glamorous'

import parms from '../parms'

const { Div } = glamorous

export default class MsgConfig extends Component {
  static getDerivedStateFromProps(nextProps, prevState) {
    if (prevState === null) {
      let { msgCan, configOptions } = nextProps
      console.log('msgCan,configOptions', msgCan, configOptions)
      let state = new Object()
      let ourOptions = configOptions[msgCan.name]
      console.log('ourOptions', ourOptions)
      msgCan.signals.forEach(k => {
        if (ourOptions && ourOptions[k.name]) {
          console.log('find', ourOptions[k.name])
          state[k.name] = { value: ourOptions[k.name] }
        } else if (Object.keys(k.labels).length) state[k.name] = { value: 0 }
        else if (k.bitLength == 1)
          state[k.name] = { value: false }
        else state[k.name] = { value: 0 }
      })
      if (nextProps.msgCan.name.includes('FilterCfg')) state.isFilter = true
      return state
    }
    return prevState
  }

  handleInputChange = e =>
    this.setState({
      [e.target.name]: {
        value: e.target.type === 'checkbox' ? e.target.checked : e.target.value,
        changed: true
      }
    })

  createSelect = (name, k) => {
    return (
      <select
        name={name}
        value={this.state[name].value}
        onChange={this.handleInputChange}
      >
        {Object.entries(k).map((x, i) => (
          <option key={i} value={x[0]}>
            {x[1]}
          </option>
        ))}
      </select>
    )
  }
  getInput = k => {
    if (Object.keys(k.labels).length) return this.createSelect(k.name, k.labels)
    else if (k.bitLength == 1)
      return (
        <input
          type="checkbox"
          name={k.name}
          checked={this.state[k.name].value}
          onChange={this.handleInputChange}
        />
      )
    else
      return (
        <input
          type="number"
          name={k.name}
          value={this.state[k.name].value}
          onChange={this.handleInputChange}
          style={{ width: '40px', height: '12px' }}
        />
      )
  }

  renderTitle = x => {
    return (
      <Div width="340px" textAlign="center" fontWeight="bold">
        <span>{x.name}</span>
        &nbsp;
        <span>{`0x${x.id.toString(16)}`}</span>
      </Div>
    )
  }

  renderLine = (k, i) => {
    let backgroundColor = this.state[k.name].changed ? '#f57c2f' : '#fcd77c'
    return (
      <div
        style={{ display: 'flex', backgroundColor: { backgroundColor } }}
        key={i}
      >
        <Div
          border="1px solid #cccccc"
          width="220px"
          float="left"
          backgroundColor={backgroundColor}
        >
          {k.name}
        </Div>
        <Div
          border="1px solid #cccccc"
          width="70px"
          float="left"
          ref={k.ref}
          backgroundColor={backgroundColor}
        >
          {this.getInput(k)}
        </Div>
        <Div
          border="1px solid #cccccc"
          width="50px"
          float="left"
          backgroundColor={backgroundColor}
        >
          {k.unit}
        </Div>
      </div>
    )
  }

  postMessageToCan = (id, payload) => {
    console.log(id,payload)
    this.props.worker.postMessage({id:'sendToCan',payload:{ id, payload }})
  }

  sendConfig = () => {
    let changed = false
    Object.entries(this.state).forEach(x => {

      console.log(
        'changed:',
        this.props.msgCan.name,
        x[0],
        +this.state[x[0]].value
        // opts,
        // this.props
      )

      this.props.worker.postMessage({
        id: 'sendToCan',
        payload: {
          id: 'updateCanDB',
          payload: {
            msg: this.props.msgCan.name,
            signal: x[0],
            value: +this.state[x[0]].value
          }
        }
      })
    })

    this.props.worker.postMessage({
      id: 'sendToCan',
      payload: {
        id: 'sendCan',
        payload: { msg: this.props.msgCan.name }
      }
    })
  }

  sendFilter = () => {
    console.log('Filter:', this.state)

    if (this.state['FilterCfg_Valid']) {
      // console.log('index',this.state['FilterCfg_Index'])
      let indStr = parms.filterIndex[this.state['FilterCfg_Index'].value]
      // console.log('indStr', indStr)
      let minInd = 'Min_' + indStr
      let maxInd = 'Max_' + indStr
      let entries = Object.entries(this.state)
      let minVal = entries.find(x => x[0].includes(minInd))
      let maxVal = entries.find(x => x[0].includes(maxInd))

      this.postMessageToCan('updateCanDB', {
        msg: 'FilterCfg',
        signal: 'FilterCfg_Valid',
        value: 1
      })
      this.postMessageToCan('updateCanDB', {
        msg: 'FilterCfg',
        signal: 'FilterCfg_Active',
        value: +this.state['FilterCfg_Active'].value
      })
      this.postMessageToCan('updateCanDB', {
        msg: 'FilterCfg',
        signal: 'FilterCfg_Type',
        value: +this.state['FilterCfg_Type'].value
      })
      this.postMessageToCan('updateCanDB', {
        msg: 'FilterCfg',
        signal: 'FilterCfg_Index',
        value: +this.state['FilterCfg_Index'].value
      })
      this.postMessageToCan('updateCanDB', {
        msg: 'FilterCfg',
        signal: minVal[0],
        value: +minVal[1].value
      })
      this.postMessageToCan('updateCanDB', {
        msg: 'FilterCfg',
        signal: maxVal[0],
        value: +maxVal[1].value
        })

      this.postMessageToCan('sendCan', {
        msg: this.props.msgCan.name
      })

    }
  }

  sendCan = () => {
    console.log('submit', this.props.msgCan)

    if (this.state.isFilter) {
      this.sendFilter()
    } else {
      this.sendConfig()
    }
  }

  renderButton = () => {
    return (
      <Div textAlign="center">
        {/*<button>Revert</button>*/}
        <button onClick={this.sendCan}>Write</button>
      </Div>
    )
  }

  componentDidMount(){
    // this.props.worker.onmessage=(e)=>{console.log('e',e)}
}

  render() {
    let x = this.props.msgCan
    return (
      <Div border="1px solid #777777" backgroundColor="#fcd77c">
        {this.renderTitle(x)}
        {x.signals.map((k, i) => this.renderLine(k, i))}
        {this.renderButton()}
      </Div>
    )
  }
}
