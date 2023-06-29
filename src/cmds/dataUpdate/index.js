'use strict'
const getDataFiles = require('./getDataFiles')
const mapGameData = require('./mapGameData')
module.exports = async(gameVersion, localeVersion, assetVersion, forceFile = false)=>{
  try{
    let res = { gameVersion: null, localeVersion: null, statCalcVersion: null }
    if(!gameVersion || !localeVersion || !assetVersion) return res;
    console.log('Starting game data update...')
    if(forceFile){
      console.log('Getting new files...')
    }else{
      console.log('Checking files...')
    }
    updateInProgress = true
    let status = false
    if(!forceFile && dataVersions.gameVersion === gameVersion && dataVersions.localeVersion === localeVersion){
      status = true
      res.gameVersion = gameVersion
      res.localeVersion = localeVersion
    }else{
      status = await getDataFiles(gameVersion, localeVersion, forceFile)
      if(status === true) status = await mapGameData(gameVersion, localeVersion, assetVersion)
      if(status === true){
        res.gameVersion = gameVersion
        res.localeVersion = localeVersion
      }
    }
    if(!status){
      updateInProgress = false
      throw('Error getting game and locale files...')
    }else{
      console.log('game and locale files are up to date...')
    }
    if(status == true){
      updateInProgress = false
      return res
    }
  }catch(e){
    updateInProgress = false
    console.error(e);
  }
}
