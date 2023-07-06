'use strict'
const Cmds = {}
Cmds.statDefMap = require('./statDefMap')
Cmds.journeyMap = require('./journeyMap')
Cmds.modDefMap = require('./modDefMap')
Cmds.dataCronDefMap = require('./dataCronDefMap')
Cmds.unitDefMap = require('./unitDefMap')
module.exports = async(gameVersion, localeVersion, assetVersion)=>{
  try{
    for(let i in Cmds){
      console.log(i+' update in progress...')
      let status = await Cmds[i](gameVersion, localeVersion, assetVersion)
      if(status === true){
        console.log(i+' update complete...')
      }else{
        throw(i+' update error...')
      }
    }
    return true
  }catch(e){
    throw(e)
  }
}
