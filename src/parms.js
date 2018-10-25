export default {
  legends: [
    { name: 'Danger', color: '#ff0000' },
    { name: 'Warning', color: '#ffff00' },
    { name: 'Blank', color: '#00ff00' }
  ],
  viewable: [],
  // viewable:['DistLat','DistLong','VrelLat','VrelLong','RCS'],

  areas: {
    warning: {
      size: {
        width: 80,
        length: 80
      },
      color: 0xffff00,
      heightShift: 0.02
    },
    danger: {
      size: {
        width: 30,
        length: 30
      },
      color: 0xff0000,
      heightShift: 0.05
    }
  },

  canvas: { width: 1600.0, height: 800.0 },
  realDims: { width: 160.0, height: 200.0 },
  singleInfoMsgs: [
    'RadarState',
    'ColDetRelayCtrl',
    'Object_0_Status',
    'VersionID',
    // 'FilterState_Cfg',
    'Cluster_0_Status',
    'ColDet_State'
  ],
  objMsgs: ['Object_1_General', 'Object_2_Quality', 'Object_3_Extended'],
  Msgs: [
    'RadarState',
    'ColDetRelayCtrl',
    'Object_0_Status',
    'FilterState_Header',
    'VersionID',
    'FilterState_Cfg',
    'Cluster_0_Status',
    'ColDet_State'
  ],
  canMsgWriteId: ['200', '202', '400', '401', '300', '301'],
  objs: [],
  filterIndex: [
    'NofObj',
    'Distance',
    'Azimuth',
    'VrelOncome',
    'VrelDepart',
    'RCS',
    'Lifetime',
    'Size',
    'ProbExists',
    'Y',
    'X',
    'VYRightLeft',
    'VXOncome',
    'VYLeftRight',
    'VXDepart'
  ]
}
