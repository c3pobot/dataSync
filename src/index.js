'use strict'
const log = require('logger')
let logLevel = process.env.LOG_LEVEL || log.Level.INFO;
log.setLevel(logLevel);
require('./socket')
require('./helpers/assetGetter')
const getGameVersions = require('./getGameVersions')
const SYNC_INTERVAL = +(process.env.SYNC_INTERVAL || 5)

const checkVersions = require('./cmds/checkVersions')

const CheckAPIReady = async()=>{
  const obj = await getGameVersions()
  if(obj?.gameVersion){
    log.info('Game API is ready on dataSync Server...')
    StartSync()
  }else{
    log.info('Game API is not ready on dataSync Server. Will try again in 5 seconds...')
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
