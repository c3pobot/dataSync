'use strict'
const log = require('logger')
const Cmds = {}
Cmds.statDefMap = require('./statDefMap')
Cmds.journeyMap = require('./journeyMap')
Cmds.modDefMap = require('./modDefMap')
Cmds.dataCronDefMap = require('./dataCronDefMap')
Cmds.unitDefMap = require('./unitDefMap')
module.exports = async(gameVersion, localeVersion, assetVersion)=>{
  try{
    for(let i in Cmds){
      log.info(i+' update in progress...')
      let status = await Cmds[i](gameVersion, localeVersion, assetVersion)
      if(status === true){
        log.info(i+' update complete...')
      }else{
        throw(i+' update error...')
      }
    }
    return true
  }catch(e){
    throw(e)
  }
}
