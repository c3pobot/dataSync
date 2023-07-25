'use strict'
const log = require('logger')
require('./helpers/assetGetter')
const getGameVersions = require('./getGameVersions')
const SYNC_INTERVAL = +(process.env.SYNC_INTERVAL || 5)

const checkVersions = require('./cmds/checkVersions')

const CheckAPIReady = async()=>{
  const obj = await getGameVersions()
  if(obj?.gameVersion){
    log.info('Game API is ready on dataSync Server...')
    require('./expressServer')
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
