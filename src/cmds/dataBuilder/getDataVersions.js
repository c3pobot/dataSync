'use strict'
const path = require('path')
const Fetch = require('../../fetch')
const PUBLIC_DATA_URI = process.env.GITHUB_REPO_RAW_URL || 'https://raw.githubusercontent.com/swgoh-utils/gamedata/main'
const PRIVATE_DATA_URI = process.env.PRIVATE_GITHUB_REPO_RAW_URL || process.env.GITHUB_REPO_RAW_URL
console.log(PUBLIC_DATA_URI)
console.log(PRIVATE_DATA_URI)
module.exports = async(gameVersion, localeVersion, forceFile = false)=>{
  try{
    if(!PRIVATE_DATA_URI) return
    let privateVersions = await Fetch.json(path.join(PRIVATE_DATA_URI, 'versions.json'), 'GET')

    if(!forceFile && privateVersions?.gameVersion === gameVersion && privateVersions?.localeVersion === localeVersion){
      dataVersions.statCalcVersion = gameVersion
      return
    }
    let publicVersions = await Fetch.json(path.join(PUBLIC_DATA_URI, 'versions.json'), 'GET')
    
    if(!publicVersions?.gameVersion || !publicVersions?.localeVersion || !publicVersions['gameData.json']) return
    if(publicVersions.gameVersion !== gameVersion) return
    if(publicVersions.localeVersion !== localeVersion) return
    if(publicVersions['gameData.json'] !== gameVersion) return
    return true
  }catch(e){
    throw(e);
  }
}
