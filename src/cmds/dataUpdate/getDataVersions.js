'use strict'
const path = require('path')
const Fetch = require('./fetch')
const dataUrl = process.env.GITHUB_DATA_URI || 'https://raw.githubusercontent.com/swgoh-utils/gamedata/main'

module.exports = async(gameVersion, localeVersion)=>{
  try{
    const versions = await Fetch.json(path.join(dataUrl, 'versions.json'), 'GET')
    if(!versions.gameVersion || !versions?.localeVersion) return
    if(versions.gameVersion !== gameVersion) return
    if(versions.localeVersion !== localeVersion) return
    if(version['gameData.json'] !== gameVersion) return
    let array = Object.values(versions)
    if(!array || array?.length === 0) return
    let totalCount = +array.length
    let updatedCount = +array.filter(x=>x === gameVersion || x === localeVersion).length
    if(totalCount === updatedCount) return versions
  }catch(e){
    throw(e);
  }
}
