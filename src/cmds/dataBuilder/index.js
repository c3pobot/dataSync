'use strict'
const getDataVersions = require('./getDataVersions')
const buildData = require('./buildData')
module.exports = async(gameVersion, localeVersion, forceFile = false)=>{
  try{
    let status = false
    if(!gameVersion || !localeVersion) return;
    console.log('Starting gameData.json update...')
    
    let updateNeeded = await getDataVersions(gameVersion, localeVersion, forceFile)
    if(!updateNeeded) return true

    console.log('modified gameData.json update in progress...')
    status = await buildData(gameVersion, localeVersion)
    if(status === true){
      console.log('modified gameData.json update complete...')
      return true
    }else{
      throw('modified gameData.json update error...')
    }
  }catch(e){
    throw(e);
  }
}
