import React, {Component} from 'react'
import {observer} from 'mobx-react'
import {floatHintState, appState} from './AppState'

@observer
class FloatHint extends Component{
    render(){
        return(
            floatHintState.visible&&appState.pt?
            <div style={{position:'absolute',
                left:floatHintState.left,
                top:floatHintState.top,
                border:'1px solid #ff0000',
                borderRadius:5,
                backgroundColor:'rgba(0.7,0.7,0.7,0.5)',
                // backgroundColor:'#333300',
                // opacity:0.4

            }}>
            <div>
                {appState.pt.name}
            </div>
            {/* <br/>     */}
            <div>
                {appState.pt.descr}
            </div>    
                {/* float */}
                </div>
                :null
        )
    }
}

export default FloatHint