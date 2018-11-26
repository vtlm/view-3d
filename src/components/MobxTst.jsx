import React, {Component} from 'react'
import {observer} from 'mobx-react'
import {toJS} from 'mobx'

@observer
class MobxTst extends Component{
render(){
    // if(this.props.pts)
    console.log('mobxTst',this.props)
    return(
        <div>
            mobxTst
             {toJS(this.props.pts).map(x=>{x.name})}

            </div>
    )
}
}

export default MobxTst

