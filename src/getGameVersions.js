'use strict'
const path = require('path')
const mongo = require('mongoapiclient')
const fetch = require('./helpers/fetch')
const GAME_API_URI = process.env.GAME_CLIENT_URL
module.exports = async()=>{
  try{
    let res = { gameVersion: null, localeVersion: null, assetVersion: null }
    let obj = await fetch(path.join(GAME_API_URI, 'metadata'), 'POST', {})
    if(obj?.latestGamedataVersion) mongo.set('metaData', {_id: obj.latestGamedataVersion}, obj)
    if(obj?.latestGamedataVersion) res.gameVersion = obj.latestGamedataVersion
    if(obj?.latestLocalizationBundleVersion) res.localeVersion = obj.latestLocalizationBundleVersion
    if(obj?.assetVersion) res.assetVersion = obj.assetVersion
    return res
  }catch(e){
    throw(e);
  }
}
