'use strict'
const log = require('logger')
const path = require('path')
const fs = require('fs')
const SaveFile = require('./saveFile')
const getDataVersions = require('./getDataVersions')

module.exports = async(gameVersion, localeVersion, assetVersion, forceFile = false)=>{
  try{
    let count = 0, totalCount = 0
    let versions = await getDataVersions(gameVersion, localeVersion, assetVersion)
    if(!versions){
      log.info('object storage files not updated yet...')
      return
    }
    if(versions) totalCount = Object.values(versions)?.filter(x=>x === gameVersion)?.length
    if(+totalCount === 0) return false
    count++;
    for(let i in versions){
      if(versions[i] === gameVersion && i !== 'gameVersion'){
        const status = await SaveFile(i, gameVersion, forceFile)
        if(status === true) count++;
      }
    }
    if(count !== +totalCount) return false
    let status = await SaveFile('Loc_ENG_US.txt.json', localeVersion, forceFile)
    if(status === true) return await SaveFile('Loc_Key_Mapping.txt.json', localeVersion, forceFile)
  }catch(e){
    throw(e);
  }
}
