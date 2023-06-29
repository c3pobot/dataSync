'use strict'
const path = require('path')
const fs = require('fs')
const SaveFile = requir('./saveFile')
const getDataVersions = require('./getDataVersions')
const dataUrl = process.env.GITHUB_DATA_URI || 'https://raw.githubusercontent.com/swgoh-utils/gamedata/main'

module.exports = async(gameVersion, localeVersion, forceFile = false)=>{
  try{
    let count = 0, totalCount = 0
    const versions = await getDataVersions(gameVersion, localeVersion)
    if(!versions){
      console.log('github files not updated yet...')
      return
    }
    if(versions) totalCount = Object.values(versions)?.filter(x=>x === gameVersion)?.length
    if(+totalCount === 0) return false
    count++;
    for(let i in versions){
      if(versions[i] === gameVersion && i !== 'gameVersion'){
        const status = await SaveFile(i, gameVersion, newFiles, forceFile)
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
