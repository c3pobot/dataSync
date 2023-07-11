'use strict'
const log = require('logger')
const dataList = require('./dataList')
const { readFile } = require('../mapGameData/lists/helper')
const { gameData } = require('helpers/gameData')
const mongo = require('mongoapiclient')
module.exports = async(gameVersion, localeVersion)=>{
  try{
    let data = await readFile('gameData.json', gameVersion)
    if(!data) throw('error reading gameData.json...')
    let count = 0, totalCount = 0
    for(let i in dataList){
      count++
      log.info('getting '+dataList[i]+'...')
      let map = (await mongo.find('configMaps', {_id: dataList[i]}))[0]
      if(map?.version === gameVersion && map.data){
        log.info('added '+dataList[i]+' to gameData.json...')
        data[dataList[i]] = map.data
        totalCount++
      }else{
        throw(dataList[i]+' update error...')
      }
    }
    if(count > 0 && count === totalCount){
      gameData.data = JSON.parse(JSON.stringify(data))
      gameData.version = gameVersion
      return true
    }
  }catch(e){
    throw(e)
  }
}
