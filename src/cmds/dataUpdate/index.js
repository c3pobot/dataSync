'use strict'
const getDataFiles = require('./getDataFiles')
const mapGameData = require('../mapGameData')
const dataBuilder = require('../dataBuilder')
module.exports = async(gameVersion, localeVersion, assetVersion, forceFile = false)=>{
  try{
    let res = { gameVersion: null, localeVersion: null }
    if(!gameVersion || !localeVersion || !assetVersion) return res;
    updateInProgress = true
    let status = false, datamapNeeded = true, dataFilesNeeded = true, gameDataUpatedNeeded = true, missingCollection = []
    if(!forceFile){
      let collectionStatus = await mapGameData.check(gameVersion, localeVersion, assetVersion)
      if(collectionStatus?.status === true){
         datamapNeeded = false
      }else{
        datamapNeeded = true
        if(collectionStatus?.missing) missingCollection = collectionStatus.missing
      }
    }
    if(forceFile) datamapNeeded = true
    console.log('Starting game data update...')
    if(forceFile){
      console.log('Getting new files...')
    }else{
      console.log('Checking files...')
    }
    if(dataVersions.gameVersion === gameVersion && dataVersions.localeVersion === localeVersion){
      if(forceFile){
        dataFilesNeeded = true
      }else{
        dataFilesNeeded = false
        status = true
      }
    }
    if(dataVersions.statCalcVersion === gameVersion && dataVersions.localeVersion === localeVersion){
      if(forceFile){
        gameDataUpatedNeeded = true
      }else{
        gameDataUpatedNeeded = false
      }
    }
    if(dataFilesNeeded) status = await getDataFiles(gameVersion, localeVersion, assetVersion, forceFile)
    if(!status){
      updateInProgress = false
      throw('Error getting game and locale files...')
    }else{
      console.log('game and locale files are up to date...')
    }
    if(status === true && datamapNeeded) status = await mapGameData.update(gameVersion, localeVersion, assetVersion, missingCollection)
    if(status === true && gameDataUpatedNeeded) status = await dataBuilder(gameVersion, localeVersion, forceFile)

    if(status == true){
      console.log('completed game data update...')
      updateInProgress = false
      res.gameVersion = gameVersion
      res.localeVersion = localeVersion
      return res
    }else{
      console.log('failed game data update...')
    }
  }catch(e){
    updateInProgress = false
    console.error(e);
  }
}
