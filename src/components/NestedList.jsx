import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import ListSubheader from "@material-ui/core/ListSubheader";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import Collapse from "@material-ui/core/Collapse";
import InboxIcon from "@material-ui/icons/MoveToInbox";
import DraftsIcon from "@material-ui/icons/Drafts";
import SendIcon from "@material-ui/icons/Send";
import ExpandLess from "@material-ui/icons/ExpandLess";
import ExpandMore from "@material-ui/icons/ExpandMore";
import StarBorder from "@material-ui/icons/StarBorder";
import PlaceIcon from "@material-ui/icons/Place";

import { observer } from "mobx-react";
import { toJS } from "mobx";
import { appState,spaState, spaStateObj } from "./AppState";
import FormDialog, {styles as stylesD} from './FormDialog'
import {db} from './ThreeView'

const styles = theme => ({
  root: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: theme.palette.background.paper
  },
  nested: {
    paddingLeft: theme.spacing.unit * 4
  }
});


@observer
class WrapDialog extends React.Component {
  render() {
    console.log('rWD',toJS(appState.mark))
    return (
      <FormDialog
        // appState={appState}
        dKey={"openEdit"}
        name={appState.mark.name ? appState.mark.name : ""}
        // level={appState.mark ? toJS(appState.mark).level : 'mid'}
        level={appState.mark.level ? appState.mark.level : 'mid'}
        descr={appState.mark.descr ? appState.mark.descr : ""}
        classes={styles}
        handleOK={this.props.handleOK}
        handleUpdate={this.props.handleUpdate}
        handleRemove={this.props.handleRemove}
        handleCancel={this.props.handleCancel}
      />
    );
  }
}


class NestedList extends React.Component {
  state = {
    open: true,
    opened: {}
  };

  handleClick = (e, x) => {
    console.log("NL click", e, x, this.state);
    // this.setState(state => ({ open: !state.open }));
    this.setState({ [x]: !this.state[x] ? true : !this.state[x] });
  };
  handleChildClick = (e, x) => {
    console.log("NL  child click", e, x, this.state);
    // this.setState(state => ({ open: !state.open }));
    //   this.setState({[x]:!this.state[x]?true:!this.state[x]})
    appState.mark=x
    appState.openEdit = true;
    appState.mouseInPanel = false;
    e.preventDefault()
    // e.stopPropagation()
  };

  hasChilds = par => {
    if (!toJS(this.props.appState.pts)) return false;

    return toJS(this.props.appState.pts).find(x => x.parent == par);
  };

  getChilds = par => {
    if (!toJS(this.props.appState.pts)) return null;
    console.log(
      "childs",
      toJS(this.props.appState.pts).filter(x => x.parent == par)
    );
    // return null
    const { classes } = this.props;
    return toJS(this.props.appState.pts)
      .filter(x => x.parent == par)
      .map((x, i) => (
        <div>
          <Collapse in={this.state[par]} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItem
                button
                className={classes.nested}
                onClick={e => this.handleChildClick(e, x)}
              >
                <ListItemIcon>{/* <StarBorder /> */}</ListItemIcon>
                <ListItemText inset primary={x.name} />
              </ListItem>
            </List>
          </Collapse>
        </div>
      ));
  };


  updateMark = state => {
    // appState.points[appState.selectedObject].push(this.tempMark.name);
    // // appState.open=true
    // let obj = {
    //   owner_id: client.auth.user.id,
    //   type: "point",
    //   parent: this.currObj.name,
    //   name: state.name,
    //   level: state.level,
    //   descr: state.descr,
    //   pos: {
    //     x: this.tempMark.position.x,
    //     y: this.tempMark.position.y,
    //     z: this.tempMark.position.z
    //   }
    // };
    // appState.pts.push(obj);
    // spaStateObj.pts.push(obj);
    let xPos = toJS(appState.mark.pos).x;
    let obj = appState.pts.find(x => x.pos.x == xPos);
    obj = Object.assign(obj, {
      name: state.name,
      level: state.level,
      descr: state.descr
    });
    obj = spaStateObj.pts.find(x => x.pos.x == xPos);

    obj = Object.assign(obj, {
      name: state.name,
      level: state.level,
      descr: state.descr
    });
  }


  removeMark = () => {
    let xPos = toJS(appState.mark.pos).x;
    let obj = appState.pts.find(x => x.pos.x == xPos);
    let i = appState.pts.indexOf(obj);
    appState.pts.splice(i, 1);
    // spaState.pts.splice(i, 1);
    spaStateObj.pts.splice(i, 1);

    console.log("remove", this.currObj, i, toJS(appState.mark.pos).x);
    this.currObj.parent.remove(this.currObj);

    db.collection("comments")
      .deleteOne({ pos: appState.mark.pos })
      .then(result => {
        // result.deletedCount === 1
        return result;
      });
  };


  render() {
    const { classes } = this.props;
    console.log("rNL", toJS(this.props.appState));

    return (
      <div className={classes.root}>
        <List
          component="nav"
          subheader={<ListSubheader component="div">Объекты</ListSubheader>}
        >

          {this.props.appState.objects.map((x, i) => (
            <div>
              <ListItem button onClick={e => this.handleClick(e, x)}>
                <ListItemIcon>
                  <PlaceIcon />
                </ListItemIcon>
                <ListItemText inset primary={x} />
                {this.hasChilds(x) ? <ExpandLess /> : null}
              </ListItem>
              <div>{this.getChilds(x)}</div>
            </div>
          ))}
        </List>



        <WrapDialog
          appState={appState}
          handleOK={()=>{appState.openEdit=false}}
          handleUpdate={this.updateMark}
          handleRemove={()=>{appState.openEdit=false;this.removeMark()}}
          handleCancel={()=>{appState.openEdit=false}}
        />


          {/* <FormDialog
          appState={appState}
          dKey={'openEdit'}
          name={appState.mark ? appState.mark.name : ''}
          level={appState.mark ? appState.mark.level : 'mid'}
          descr={appState.mark ? appState.mark.descr : ''}
          classes={stylesD}
          handleOK={()=>{appState.openEdit=false}}
          handleRemove={()=>{appState.openEdit=false}}
          handleCancel={()=>{appState.openEdit=false}}
          /> */}

      </div>
    );
  }
}

NestedList.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(NestedList);
