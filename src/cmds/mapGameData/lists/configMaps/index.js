'use strict'
const Cmds = {}
Cmds.statMap = require('./statMap')
Cmds.journeyMap = require('./journeyMap')
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
