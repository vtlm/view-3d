import React, { Component } from "react";
// import uuidv1 from 'uuid'
// import CanApp from './CanApp2'

// import * as d3 from "d3";
import ThreeView from "./ThreeView";

import "./MainView.css";

let d3ref1 = React.createRef();
let ref3d = React.createRef();

export default class MainView extends Component {
  state = {};

  render() {
    console.log("render mainView", this);

    return (
      <div>
        <div
          id="main-id"
          style={{
            // border: '1px solid #ff0000',
            display: "flex",
            width: "100vw",
            height: "100vh"
          }}
        >
          <div
            id="main-id-1"
            style={{
              position: "relative",
              // border: '1px solid #ff0000',
              width: "100%",
              height: "100%"
            }}
            onMouseLeave={e => {
              console.log("Leave MV", e);
            }}
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
    );
  }
}
