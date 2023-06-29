'use strict'
const dataList = require('./dataList')
const saveGitFile = require('./saveGitFile')
const gitHubClient = require('./gitHubClient')
const { readFile } = require('../mapGameData/lists/helper')
module.exports = async(gameVersion, localeVersion)=>{
  try{
    let gameData = await readFile('gameData.json', gameVersion)
    if(!gameData) return
    let count = 0, totalCount = 0
    for(let i in dataList){
      count++
      console.log(dataList[i]+' update in progress...')
      let map = (await mongo.find('configMaps', {_id: dataList[i]}))[0]
      if(map?.version === gameVersion && map.data){
        console.log(dataList[i]+' update complete...')
        gameData[dataList[i]] = map.data
        totalCount++
      }else{
        throw(dataList[i]+' update error...')
      }
    }
    if(count > 0 && count === totalCount){
      //await mongo.set('gameData', {_id: gameVersion}, {gameVersion: gameVersion, localeVersion: localeVersion, data: gameData})

      let repoFiles = await gitHubClient.getRepoFiles()
      let status = await saveGitFile({version: gameVersion, data: gameData}, 'gameData.json', gameVersion, repoFiles?.find(x=>x.name === 'gameData.json')?.sha)
      if(status?.content?.sha) status = await saveGitFile({gameVersion: gameVersion, localeVersion: localeVersion}, 'versions.json', gameVersion, repoFiles?.find(x=>x.name === 'versions.json')?.sha)
      if(status?.content?.sha){
        dataVersions.statCalcVersion = gameVersion
        return true
      }
    }
  }catch(e){
    throw(e)
  }
}
