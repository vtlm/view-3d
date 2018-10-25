//CAN message view (with multiple IDs)
import React, { Component } from 'react'

import parms from '../parms'


export default class MsgViewMultiple extends Component {
  render() {
    let x = this.props.msgCan
    return (
      <div style={{ flexGrow:1, flexBasis:'32%', border:"1px solid #333333", backgroundColor:"#f9edd0"}}>
        <div style={{display:'flex', fontWeight:"bold"}}>
          <span>{x.name}</span>
          &nbsp;
          <span>{`0x${x.id.toString(16)}`}</span>
        </div>
        <div>
          {x.signals.map((k, t) => (
            <div style={{ display: 'flex' }} key={t}>
              <div style={{flex:"0 0 220px", border:"1px solid #cccccc"}}>
                {k.name}
              </div>

              <div style={{flex:"0 0 50px", border:"1px solid #cccccc"}}>
                {k.unit}
              </div>

              {k.values.map((r, i) => (
                <div
                  key={i}
                  ref={r.ref}
                  style={{
                    flex: '0 0 70px',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    border: '1px solid #cccccc'
                  }}
                >
                  {r.value}
                </div>

             ))}
            </div>
          ))}
        </div>
      </div>
    )
  }
}



//               <div style={{flex:"0 0 50px", border:"1px solid #cccccc"}}>
//                 {k.unit}
//               </div>

//               {k.values.map((r, i) => (
//                 <div
//                   key={i}
//                   ref={r.ref}
//                   style={{
//                     flex: '0 0 70px',
//                     overflow: 'hidden',
//                     //whiteSpace: 'nowrap',
//                     border: '1px solid #cccccc'
//                   }}
//                 >
//                   {r.value}
//                 </div>
//               ))}


// // export default class MsgViewMultiple extends Component {
//   render() {
//     let x = this.props.msgCan
//     return (
//       <Div display='inline-flex' flexDirection='column' border="1px solid #777777" backgroundColor="#f9edd0">
//         <Div display='flex' fontWeight="bold">
//           <span>{x.name}</span>
//           &nbsp;
//           <span>{`0x${x.id.toString(16)}`}</span>
//         </Div>
//         <div>
//           {x.signals.map((k, t) => (
//             <div style={{ display: 'flex' }} key={t}>
//               <Div flex="0 0 220px" border="1px solid #cccccc">
//                 {k.name}
//               </Div>

//               <Div flex="0 0 50px" border="1px solid #cccccc">
//                 {k.unit}
//               </Div>

  //             {k.values.map((r, i) => (
  //               <div
  //                 key={i}
  //                 ref={r.ref}
  //                 style={{
  //                   flex: '0 0 70px',
  //                   overflow: 'hidden',
  //                   whiteSpace: 'nowrap',
  //                   border: '1px solid #cccccc'
  //                 }}
  //               >
  //                 {r.value}
  //               </div>
  //             ))}
  //           </div>
  //         ))}
  //       </div>
  //     </Div>
  //   )
  // }
// }
