import { observable } from 'mobx'

class AppState {
  @observable currentTime = 0
  @observable objects = []
  @observable selectedObject = ''
  @observable hoveredObjectInPanel = ''
  @observable selectedObjectInPanel = ''
  @observable hoveredMarkInPanel = 0
  @observable selectedMarkInPanel = 0
  @observable mouseInPanel = false
  @observable tagJSON = {}
  @observable points = {}
  @observable open = false
  @observable openEdit = false
  @observable mark = {}
  @observable selectMode='obj'
  @observable pt={}
  // constructor() {
  //       this.currentTime=4;
  //         setInterval(() => {                                                                                                                                                                
  //             console.log('inc',this.currentTime)
  //             this.currentTime += 1;
  //         }, 1000);
  //     }                                                                                                                                                                                                                                                                                                                                                                  
}                                                                                                                                                  
const appState = new AppState()

class DialogState{
  @observable name='name'
  @observable level='mid'
  @observable comment='comment'
}
const dialogState=new DialogState()

class FloatHintState{
  @observable visible=false
  @observable left=0
  @observable top=0
}
const floatHintState = new FloatHintState()

export {appState,dialogState,floatHintState}
