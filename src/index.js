'use strict'
const MongoWrapper = require('mongowrapper')
const Fetch = require('./fetch')
const CheckVersions = require('./checkVersions')
const DataUpdate = require('./dataUpdate')
const DataBuilder = require('./dataBuilder')
const GetGameVersions = require('./getGameVersions')
global.updateInProgress = 0
global.mongo = new MongoWrapper({
  url: 'mongodb://'+process.env.MONGO_USER+':'+process.env.MONGO_PASS+'@'+process.env.MONGO_HOST+'/',
  authDb: process.env.MONGO_AUTH_DB,
  appDb: process.env.MONGO_DB,
  repSet: process.env.MONGO_REPSET
})
global.GameDataVersions = {
  gameVersion: null,
  localeVersion: null,
  gameDataVersion: null
}
const CheckMongo = async()=>{
  const status = await mongo.init();
  if(status > 0){
    console.log('Mongo connection successful...')
    CheckAPIReady()
  }else{
    console.error('Mongo connection error. Will try again in 10 seconds')
    setTimeout(()=>CheckMongo(), 5000)
  }
}

const CheckAPIReady = async()=>{
  const obj = await GetGameVersions()
  if(obj?.gameVersion){
    console.log('Game API is ready on dataSync Server...')
    UpdateDataVersions()
  }else{
    console.log('Game API is not ready on dataSync Server. Will try again in 5 seconds...')
    setTimeout(()=>CheckAPIReady(), 5000)
  }
}
const UpdateDataVersions = async()=>{
  try{
    const obj = (await mongo.find('botSettings', {_id: 'gameVersion'}, {_id: 0, gameVersion: 1, localeVersion: 1}))[0]
    if(obj?.gameVersion && obj?.localeVersion) GameDataVersions = {...GameDataVersions,...obj}
    const gData = (await mongo.find('botSettings', {_id: 'gameData'}, {_id: 0, version: 1}))[0]
    if(gData?.version) GameDataVersions.statCalcVersion = gData.version
    StartSync()
  }catch(e){
    console.error(e);
  }
}
const StartSync = async()=>{
  try{
    const obj = await GetGameVersions(), status = false, gameDataNeeded = false, statCalcDataNeeded = false
    if(obj?.gameVersion && obj?.localeVersion){
      if(GameDataVersions.gameVersion !== obj.gameVersion || GameDataVersions.localeVersion !== obj.localeVersion) gameDataNeeded = true
      if(GameDataVersions.statCalcVersion !== obj.gameVersion || GameDataVersions.localeVersion !== obj.localeVersion) statCalcDataNeeded = true
    }
    if(gameDataNeeded || statCalcDataNeeded) status = await CheckVersions(obj?.gameDataVersion, obj?.localeVersion)
    if(status && statCalcDataNeeded && !updateInProgress){
      updateInProgress = 1
      await DataBuilder(obj.gameVersion, obj.localeVersion, false)
      updateInProgress = 0
    }
    if(status && gameDataNeeded && !updateInProgress){
      updateInProgress = 1
      await DataUpdate(obj.gameVersion, obj.localeVersion, false)
      updateInProgress = 0
    }
    setTimeout(StartSync, +process.env.UPDATE_INTERVAL || 30000)
  }catch(e){
    console.error(e);
    setTimeout(StartSync, +process.env.UPDATE_INTERVAL || 30000)
  }
}
CheckMongo()
