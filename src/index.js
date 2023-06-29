'use strict'
const MongoWrapper = require('mongowrapper')
const Fetch = require('./fetch')
const getGameVersions = require('./getGameVersions')
const SYNC_INTERVAL = +(process.env.SYNC_INTERVAL || 1)

const { checkVersions } = require('./cmds')
global.updateInProgress = false
global.initialCheck = true
global.mongo = new MongoWrapper({
  url: 'mongodb://'+process.env.MONGO_USER+':'+process.env.MONGO_PASS+'@'+process.env.MONGO_HOST+'/',
  authDb: process.env.MONGO_AUTH_DB,
  appDb: process.env.MONGO_DB,
  repSet: process.env.MONGO_REPSET
})
global.dataVersions = {
  gameVersion: null,
  localeVersion: null,
  statCalcVersion: null
}
const CheckMongo = async()=>{
  const status = await mongo.init();
  if(status > 0){
    console.log('Mongo connection successful...')
    mongoReady = true
    CheckAPIReady()
  }else{
    console.error('Mongo connection error. Will try again in 10 seconds')
    setTimeout(()=>CheckMongo(), 5000)
  }
}

const CheckAPIReady = async()=>{
  const obj = await getGameVersions()
  if(obj?.gameVersion){
    console.log('Game API is ready on dataSync Server...')
    StartSync()
  }else{
    console.log('Game API is not ready on dataSync Server. Will try again in 5 seconds...')
    setTimeout(()=>CheckAPIReady(), 5000)
  }
}
const StartSync = async()=>{
  try{
    let obj = await getGameVersions()
    if(obj?.gameVersion && obj?.localeVersion && obj?.assetVersion){
      await checkVersions(obj)
    }
    setTimeout(StartSync, SYNC_INTERVAL * 60 * 1000)
  }catch(e){
    console.error(e);
    setTimeout(StartSync, 5000)
  }
}
CheckMongo()
