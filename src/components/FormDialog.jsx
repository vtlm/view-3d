import React, { Component } from 'react'
import { observer } from 'mobx-react'

import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import MenuItem from '@material-ui/core/MenuItem'

import {appState} from './AppState'

const styles = theme => ({
  container: {
    display: 'flex',
    flexWrap: 'wrap'
  },
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit
  },
  dense: {
    marginTop: 16
  },
  menu: {
    width: 200
  }
})

const currencies = [
  {
    value: 'low',
    label: 'Низкая'
  },
  {
    value: 'mid',
    label: 'Средняя'
  },
  {
    value: 'high',
    label: 'Высокая'
  }
]

@observer
class FormDialog extends React.Component {
  state = {
    open: false,
    name: 'Название',
    descr: 'Описание',
    age: '',
    multiline: 'Controlled',
    level: 'undef'
  }

  static getDerivedStateFromProps(props, state){
    console.log('gdsfp',state,props)
    if(!appState[props.dKey])
      return null
    if(state.level === 'undef'){
      state.level=props.level
      return state
    }
    return null
    // if(props.name)state.name=props.name
    // if(props.descr)state.descr=props.descr
    // if(props.name || props.descr)
    //   return state
    // return null
  }

  handleChange = name => event => {
    console.log('onChange', name)
    console.log(event.target, event.target.value)
    this.setState({ [name]: event.target.value })
    console.log(this.state)
  }

  handleOK = (e) => {
    appState.open = false
    // console.log(this.state)
    this.props.handleOK(this.state)
    appState.mouseInPanel=false
    console.log(e)
    e.preventDefault()
    this.setState({level:'undef'})
    // e.stopPropagate()
  }

  handleRemove = () => {
    // console.log(this.state)
    this.props.handleRemove(this.state)
    appState[this.props.dKey] = false
    appState.mouseInPanel=false
  }

  handleClose = () => {
    appState.open = false
    this.props.handleCancel()
    appState.mouseInPanel=false
    this.setState({level:'undef'})
  }

  render() {
    const { classes } = this.props
    console.log('FD props',this.props)//,appState.mark)
    return (
      // <div>
        <Dialog
          open={appState[this.props.dKey]}
          onClose={this.handleClose}
          aria-labelledby="form-dialog-title"
        >
          <DialogTitle id="form-dialog-title">Параметры метки</DialogTitle>
          
          <DialogContent>
            {/*<DialogContentText>
            Имя
          </DialogContentText>
*/}

            {/* {this.props.name} */}
            <TextField
              autoFocus
              margin="dense"
              id="name"
              label="Название"
              defaultValue={this.props.name}
              // value={this.props.name}
              type="email"
              fullWidth
              onChange={this.handleChange('name')}
            />

            {/* <DialogContentText>
            Описание
          </DialogContentText> */}


            <TextField
              id="filled-select-level"
              select
              label="Критичность"
              className={classes.textField}
              value={this.state.level}
              onChange={this.handleChange('level')}
              SelectProps={{
                MenuProps: {
                  className: classes.menu
                }
              }}
              // helperText="Please select your level"
              margin="normal"
              variant="filled"
            >

              {currencies.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              margin="dense"
              id="descr"
              label="Описание"
              defaultValue={this.props.descr}
              type="email"
              fullWidth
              onChange={this.handleChange('descr')}
            />
            
          </DialogContent>

          <DialogActions>
            <Button onClick={this.handleClose} color="primary">
              Отмена
            </Button>
            {this.handleRemove?
            <Button onClick={this.handleRemove} color="primary">
              Удалить
            </Button>
            :null
            }
            <Button onClick={this.handleOK} color="primary">
              Добавить
            </Button>
          </DialogActions>
        </Dialog>
      // </div>
    )
  }
}

export default FormDialog
export { styles }
