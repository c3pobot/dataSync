'use strict'
const lists = require('./lists')
const mongo = require('mongoapiclient')
const checkVersion = (gameVersion, localeVersion, assetVersion, data)=>{
  try{
    let status = true
    if(!gameVersion || !localeVersion || !assetVersion || !data) return
    if(data.gameVersion !== gameVersion) status = false
    if(data.localeVersion !== localeVersion) status = false
    if(data.assetVersion !== assetVersion) status = false
    return status
  }catch(e){
    throw(e)
  }
}
module.exports.update = async(gameVersion, localeVersion, assetVersion, missing = [])=>{
  try{
    let status = true

    for(let i in lists){
      if(missing.length > 0 && missing.filter(x=>x === i).length === 0) continue;
      console.log(i+' update in progress...')
      status = await lists[i](gameVersion, localeVersion, assetVersion)
      if(status === true){
        await mongo.set('versions', {_id: i}, { gameVersion: gameVersion, localeVersion: localeVersion, assetVersion: assetVersion })
        console.log(i+' update complete...')
      }else{
        throw(i+' update error...')
      }
    }
    console.log('gamedata update complete...')
    return status
  }catch(e){
    throw(e);
  }
}
module.exports.check = async(gameVersion, localeVersion, assetVersion)=>{
  try{
    let count = 0, totalCount = 0, missing = []
    for(let i in lists){
      count++
      let versions = (await mongo.find('versions', {_id: i}))[0]
      if(versions){
        let status = await checkVersion(gameVersion, localeVersion, assetVersion, versions)
        if(status === true){
          totalCount++;
        }else{
          console.log('missing collection '+i+'...')
          missing.push(i)
        }
      }else{
        console.log('missing collection '+i+'...')
        missing.push(i)
      }
    }
    if(totalCount > 0 && count === totalCount){
      return {status: true}
    }else{
      return {status: false, missing: missing}
    }
  }catch(e){
    throw(e)
  }
}
