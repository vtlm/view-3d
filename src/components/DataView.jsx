import React, { Component } from 'react'
import { observer } from 'mobx-react'


import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Input from '@material-ui/core/Input';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import FilledInput from '@material-ui/core/FilledInput';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';

// const styles = theme => ({
//   root: {
//     display: 'flex',
//     flexWrap: 'wrap',
//   },
//   formControl: {
//     margin: theme.spacing.unit,
//     minWidth: 120,
//   },
//   selectEmpty: {
//     marginTop: theme.spacing.unit * 2,
//   },
// });

import FormDialog, {styles} from './FormDialog'
import {appState} from './AppState'

import NestedList from './NestedList'

@observer
class ViewLine extends Component {
  // onMouseMove=e=>{console.log('mousemove');e.preventDefault()}

  render() {
    console.log('ViewLine render', appState.selectedObject)
    return (
      <a href="#">
        <div
          style={this.props.getStyle}
          // onMouseMove={this.onMouseMove}
          onMouseOver={this.props.onMouseOver}
          // onMouseOut={this.onMouseOut}
          onClick={this.props.onClick}
        >
          {this.props.name}
        </div>{' '}
      </a>
    )
  }
}

@observer
class DataView extends Component {
  printName() {
    return appState.pts.filter(x => x.parent == appState.selectedObjectInPanel)
      .length > 0
      ? 'Метки:'
      : null
  }

  onMouseOverObject = name => e => {
    // appState.hoveredObjectInPanel = name
    // e.preventDefault()
    // console.log('mouseEnter',appState.hoveredObjectInPanel)
  }

  onClickObject = name => e => {
    //console.log('click');
    appState.hoveredObjectInPanel = name
    appState.selectedObjectInPanel = name
    appState.selectedMarkInPanel = 0
    e.stopPropagation()
    e.preventDefault()
  }

  getObjectStyle = name => {
    return {
      color: appState.hoveredObjectInPanel == name ? '#ff0000' : '#000000',
      textDecoration:'none !important'
    }
  }

  onMouseOverMark = k => e => {
    // appState.hoveredMarkInPanel = k
    // e.preventDefault()
    // console.log('mouseEnter',appState.hoveredObjectInPanel)
  }

  onClickMark = k => e => {
    //console.log('click');
    appState.hoveredMarkInPanel = k
    appState.selectedMarkInPanel = k
    let mark = appState.pts.find(x => x.pos.x == k)
    appState.mark=mark
    console.log('mark=',mark)
    e.preventDefault()
  }

  getMarkStyle = k => {
    return {
      color: appState.hoveredMarkInPanel == k ? '#ff0000' : '#000000'
    }
  }

  getMarkParms = k => {
    let mark = appState.pts.find(x => x.pos.x == k)
    // appState.mark=mark
    // console.log(mark)
    return (
      <a
        href="#"
        onClick={() => {
          //console.log('mark clicked!');
          appState.openEdit = true
          appState.mouseInPanel=false
        }}
      >
        <div>
          <div style={{ color: '#4444aa' }}>Метка:</div>
          {mark.name}
          <br />
          {mark.level}
          <br />
          {mark.descr}
        </div>
      </a>
    )
  }

  handleSelectChange=(e)=>{
    // console.log(e.target.value)
    appState.selectMode=e.target.value
  }

  render() {
    // return null
    console.log('DataView rend', appState) //[appState.selectedObjectInPanel])
    const { classes } = this.props;
    return (
      <div style={{ fontSize: 'small'
      // ,textDecoration:'none' 
    }}>

    {/* <NestedList appState={this.props.appState} pts={this.props.pts}/> */}

<FormControl className={{
    // margin: theme.spacing.unit,
    minWidth: 120,
  }}>
          <InputLabel htmlFor="sel-simple">Выбор по</InputLabel>
          <Select
            value={appState.selectMode}
            onChange={this.handleSelectChange}
            inputProps={{
              name: 'sel',
              id: 'sel-simple',
            }}
          >
            <MenuItem value={'obj'}>Объектам</MenuItem>
            <MenuItem value={'mark'}>Меткам</MenuItem>
          </Select>
</FormControl>

        <div style={{ color: '#4444aa' }}>{'Вышки:'}</div>
        {this.props.appState.objects.map((x, i) => (
          <ViewLine
            key={i}
            name={x}
            onMouseOver={this.onMouseOverObject(x)}
            onClick={this.onClickObject(x)}
            getStyle={this.getObjectStyle(x)}
          />
        ))}
        {/*<div>{this.props.appState.selectedObject}</div>*/}
        {appState.selectedObjectInPanel != '' ? (
          <div>
            <div style={{ color: '#4444aa' }}>{this.printName()}</div>
            {appState.pts
              .filter(x => x.parent == appState.selectedObjectInPanel)
              .map((x, i) => (
                <ViewLine
                  key={i}
                  name={x.name}
                  onMouseOver={this.onMouseOverMark(x.pos.x)}
                  onClick={this.onClickMark(x.pos.x)}
                  getStyle={this.getMarkStyle(x.pos.x)}
                />
              ))}
          </div>
        ) : null}
        {appState.selectedMarkInPanel != 0
          ? this.getMarkParms(appState.selectedMarkInPanel)
          : null}

          {/* <FormDialog
          appState={appState}
          dKey={'openEdit'}
          name={appState.mark ? appState.mark.name : ''}
          level={appState.mark ? appState.mark.level : 'mid'}
          descr={appState.mark ? appState.mark.descr : ''}
          classes={styles}
          handleOK={()=>{appState.openEdit=false}}
          handleRemove={()=>{appState.openEdit=false}}
          handleCancel={()=>{appState.openEdit=false}}
          /> */}


      </div>
    )
  }
}

export default DataView
