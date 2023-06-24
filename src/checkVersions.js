'use strict'
const path = require('path')
const Fetch = require('./fetch')
const dataUrl = process.env.GITHUB_DATA_URI || 'https://raw.githubusercontent.com/swgoh-utils/gamedata/main'

const getVersions = async()=>{
  try{
    const obj = await
    if(obj) return await obj.json()
  }catch(e){
    console.error(e);
  }
}
module.exports = async(gameVersion, localeVersion)=>{
  try{
    const versions = await Fetch.json(path.join(dataUrl, 'versions.json'), 'GET')
    if(!versions?.gameVersion || !version?.localeVersion) return
    if(version.gameVersion !== gameVersion) return
    if(!versions.localeVersion !== localeVersion) return
    let array = Object.values(versions), totalCount = 0, localeCount = 0, gameCount = 0
    if(!array || array?.length === 0) return
    let totalCount = +array.length
    let updatedCount = +array.filter(x=>x === gameVersion || x === localeVersion).length
    if(totalCount === updatedCount) return true
  }catch(e){
    console.error(e);
  }
}
