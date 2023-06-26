'use strict'
const getDataFiles = require('./getDataFiles')
const mapGameData = require('./mapGameData')
module.exports = async(gameVersion, localeVersion, assetVersion, forceFile = false)=>{
  try{
    let res = { gameVersion: null, localeVersion: null, statCalcVersion: null }
    if(!gameVersion || !localeVersion) return res;
    console.log('Starting game data update...')
    if(forceFile){
      console.log('Getting new files...')
    }else{
      console.log('Checking files...')
    }
    let status = await getDataFiles(gameVersion, localeVersion, forceFile)
    if(!status) return res
    if(!forceFile && dataVersions.gameVersion === gameVersion && dataVersions.localeVersion === localeVersion){
      status = true
      res.gameVersion = gameVersion
      res.localeVersion = localeVersion
    }else{
      status = await mapGameData(gameVersion, localeVersion, assetVersion)
      if(status === true){
        res.gameVersion = gameVersion
        res.localeVersion = localeVersion
      }
    }
    if(!status) console.log('Error getting game data files')
    if(status == true){

    }
  }catch(e){
    console.error(e);
  }
}
