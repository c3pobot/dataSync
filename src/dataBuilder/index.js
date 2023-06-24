'use strict'
const getDataFiles = require('./getDataFiles')
module.exports = async(gameVersion, localeVersion, forceFile = false)=>{
  try{
    let status = true
    if(!gameVersion || !localeVersion) return;
    console.log('Starting gameData.json update...')
    if(forceFile){
      console.log('Getting new files...')
    }else{
      console.log('Checking files...')
    }
    filesUpdated = await getDataFiles(gameVersion, localeVersion, forceFile)
    if(!filesUpdated) console.log('Error getting game data files')
    if(filesUpdated && status){
      GameDataVersions.gameDataVersion = gameVersion
      console.log('gameData.json updated to '+gameVersion+'...')
    }
  }catch(e){
    console.error(e);
  }
}
