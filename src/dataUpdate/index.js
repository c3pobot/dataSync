'use strict'
const path = require('path')
const Fetch = require('../fetch')
const getDataFiles = require('./getDataFiles')
const GAME_API_URI = process.env.CLIENT_URL

const getGameVersions = async(newFiles = true)=>{
  try{
    let res = {gVersion: null, lVersion: null}, obj
    if(newFiles){
      obj = await Fetch.json(path.join(GAME_API_URI, 'metadata'), 'POST', {})
      res.gVersion = obj?.latestGamedataVersion
      res.lVersion = obj?.latestLocalizationBundleVersion
    }else{
      obj = (await mongo.find('botSettings', {_id: 'gameVersion'}))[0]
      res.gVersion = obj.gameVersion
      res.lVersion = obj.localeVersion
    }
    return res
  }catch(e){
    console.error(e);
  }
}
module.exports = async(newFiles = true)=>{
  try{
    let filesUpdated = false, status = true
    let { gVersion, lVersion } = await getGameVersions(newFiles)
    if(!gVersion || !lVersion) return;
    if(!newFiles) filesUpdated = true
    console.log('Starting game data update...')
    if(newFiles){
      console.log('Getting new files...')
      filesUpdated = await getDataFiles(gVersion, lVersion)
      if(!filesUpdated) console.log('Error getting game data files')
    }
    if(filesUpdated && status){
      GameDataVersions.gameVersion = gVersion
      GameDataVersions.localeVersion = lVersion
      await mongo.set('botSettings', {_id: 'gameVersion'}, {gameVersion: gVersion, localeVersion: lVersion})
      console.log('game data updated to '+gVersion+'. Locale updated to '+lVersion+'...')
    }
  }catch(e){
    console.error(e);
  }
}
