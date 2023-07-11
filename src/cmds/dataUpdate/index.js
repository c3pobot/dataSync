'use strict'
const log = require('logger')
const getDataFiles = require('./getDataFiles')
const mapGameData = require('../mapGameData')
const { dataVersions } = require('helpers/dataVersions')

module.exports = async(gameVersion, localeVersion, assetVersion, forceFile = false)=>{
  try{
    if(!gameVersion || !localeVersion || !assetVersion) return;
    let status = false, datamapNeeded = true, dataFilesNeeded = true, missingCollection = []
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
    log.info('Starting game data update...')
    if(forceFile){
      log.info('Getting new files...')
    }else{
      log.info('Checking files...')
    }
    if(dataVersions.gameVersion === gameVersion && dataVersions.localeVersion === localeVersion){
      if(forceFile){
        dataFilesNeeded = true
      }else{
        dataFilesNeeded = false
        status = true
      }
    }
    if(dataFilesNeeded) status = await getDataFiles(gameVersion, localeVersion, assetVersion, forceFile)
    if(!status){
      throw('Error getting game and locale files...')
    }else{
      log.info('game and locale files are up to date...')
    }
    if(status === true && datamapNeeded) status = await mapGameData.update(gameVersion, localeVersion, assetVersion, missingCollection)
    if(status == true){
      log.info('completed game data update...')
      dataVersions.gameVersion = gameVersion
      dataVersions.localeVersion = localeVersion
      return true
    }else{
      throw('failed game data update...')
    }
  }catch(e){
    throw(e);
  }
}
