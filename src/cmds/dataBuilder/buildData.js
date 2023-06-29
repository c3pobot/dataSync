'use strict'
const lists = require('./lists')
const saveGitFile = require('./saveGitFile')
const gitHubClient = require('./gitHubClient')
const { readFile } = require('../mapGameData/lists/helper')
module.exports = async(gameVersion, localeVersion)=>{
  try{
    let gameData = await readFile('gameData.json', gameVersion)
    if(!gameData) return
    let count = 0, totalCount = 0
    for(let i in lists){
      count++
      console.log(i+' update in progress...')
      let data = await lists[i](gameVersion, localeVersion)
      if(!data) throw(i+' update error...')
      gameData[i] = data
      totalCount++
      console.log(i+' update complete...')
    }
    if(count > 0 && count === totalCount){
      await mongo.set('gameData', {_id: gameVersion}, {gameVersion: gameVersion, localeVersion: localeVersion, data: gameData})

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
