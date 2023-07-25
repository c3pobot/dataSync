'use strict'
const path = require('path')
const fetch = require('helpers/fetch')
const S3_API_URI = process.env.S3_API_URI
const S3_BUCKET = process.env.S3_DATA_BUCKET || 'gamedata'

module.exports = async(gameVersion, localeVersion, assetVersion)=>{
  try{
    let versions = await fetch(path.join(S3_API_URI, 'get?Bucket='+S3_BUCKET+'&Key=versions.json'))
    if(!versions.gameVersion || !versions?.localeVersion) return
    if(versions.gameVersion !== gameVersion) return
    if(versions.localeVersion !== localeVersion) return
    if(versions['gameData.json'] !== gameVersion) return
    let array = Object.values(versions)
    if(!array || array?.length === 0) return
    let totalCount = +array.length
    let updatedCount = +array.filter(x=>x === gameVersion || x === localeVersion || x === assetVersion).length
    if(totalCount === updatedCount) return versions
  }catch(e){
    throw(e);
  }
}
