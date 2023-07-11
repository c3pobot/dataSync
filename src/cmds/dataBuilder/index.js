'use strict'
const log = require('logger')
const { gameData } = require('helpers/gameData')
const { dataVersions } = require('helpers/dataVersions')
const buildData = require('./buildData')
module.exports = async(gameVersion, localeVersion, forceFile = false)=>{
  try{
    if(!gameVersion || !localeVersion) return;
    if(!forceFile && gameData.version === gameVersion && dataVersions.localeVersion === localeVersion ) return true
    log.info('modified gameData.json update in progress...')
    let status = await buildData(gameVersion, localeVersion)
    if(status === true){
      log.info('modified gameData.json update complete...')
      return true
    }else{
      throw('modified gameData.json update error...')
    }
  }catch(e){
    throw(e);
  }
}
