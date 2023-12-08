'use strict'
const log = require('logger')
const mongo = require('mongoapiclient')
require('./helpers/assetGetter')
const getGameVersions = require('./getGameVersions')
const SYNC_INTERVAL = +(process.env.SYNC_INTERVAL || 5)

const checkVersions = require('./cmds/checkVersions')
const CheckMongo = ()=>{
  try{
    let status = mongo.status()
    if(status){
      CheckAPIReady()
      return
    }
    setTimeout(CheckMongo, 5000)
  }catch(e){
    log.error(e)
    setTimeout(CheckMongo, 5000)
  }
}
const CheckAPIReady = async()=>{
  try{
    let obj = await getGameVersions()
    if(obj?.gameVersion){
      log.info('Game API is ready on dataSync Server...')
      StartSync()
      return
    }
    log.info('Game API is not ready on dataSync Server. Will try again in 5 seconds...')
    setTimeout(()=>CheckAPIReady(), 5000)
  }catch(e){
    log.error(e)
    setTimeout(()=>CheckAPIReady(), 5000)
  }
}
const StartSync = async()=>{
  try{
    await checkVersions()
    setTimeout(StartSync, SYNC_INTERVAL * 60 * 1000)
  }catch(e){
    log.error(e);
    setTimeout(StartSync, 5000)
  }
}
CheckAPIReady()
