'use strict'
const path = require('path')
const MongoWrapper = require('mongowrapper')
const Fetch = require('./fetch')
const GAME_API_URI = process.env.API_URI
global.mongo = new MongoWrapper({
  url: 'mongodb://'+process.env.MONGO_USER+':'+process.env.MONGO_PASS+'@'+process.env.MONGO_HOST+'/',
  authDb: process.env.MONGO_AUTH_DB,
  appDb: process.env.MONGO_DB,
  repSet: process.env.MONGO_REPSET
})
global.GameDataVersions = {
  gameVersion: '',
  localeVersion: ''
}
const CheckMongo = async()=>{
  const status = await mongo.init();
  if(status > 0){
    mongoReady = 1
    console.log('Mongo connection successful...')
    StartServices()
  }else{
    console.error('Mongo connection error. Will try again in 10 seconds')
    setTimeout(()=>CheckMongo(), 5000)
  }
}

const CheckAPIReady = async()=>{
  const obj = await Fetch.json(path.join(GAME_API_URI, 'metadata'), 'POST', {})
  if(obj?.latestGamedataVersion){
    console.log('Game API is ready on dataSync Server...')
    UpdateDataVersions()
  }else{
    console.log('Game API is not ready on dataSync Server. Will try again in 5 seconds...')
    setTimeout(()=>CheckAPIReady(), 5000)
  }
}
const UpdateDataVersions = async()=>{
  try{
    const obj = (await mongo.find('botSettings', {_id: 'gameVersion'}))[0]
    if(obj?.gameVersion && obj?.localeVersion) GameDataVersions = obj
  }catch(e){
    console.error(e);
  }
}
const StartSync = async()=>{
  try{
    const obj = await Fetch.json(path.join(GAME_API_URI, 'metadata'), 'POST', {})
    if(obj?.latestGamedataVersion && (GameDataVersions.gameVersion !== obj?.latestGamedataVersion || GameDataVersions.localeVersion !== obj?.latestLocalizationBundleVersion)){
      const status = await CheckVersions(obj?.latestGamedataVersion, obj?.latestLocalizationBundleVersion)
      if(status) await DataUpdate(true)
    }
    setTimeout(StartSync, +process.env.UPDATE_INTERVAL || 30000)
  }catch(e){
    console.error(e);
    setTimeout(StartSync, +process.env.UPDATE_INTERVAL || 30000)
  }
}
CheckMongo()
