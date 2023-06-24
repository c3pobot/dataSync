'use strict'
const path = require('path')
const fs = require('fs')
const Fetch = require('../fetch')
const SaveFile = requir('../saveFile')
const dataUrl = process.env.GITHUB_DATA_URI || 'https://raw.githubusercontent.com/swgoh-utils/gamedata/main'

module.exports = async(gameVersion, localeVersion, forceFile = false)=>{
  try{
    let count = 0, totalCount = 0
    const versions = await Fetch.json(path.join(dataUrl, 'versions.json'), 'GET')
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
    return await SaveFile('Loc_ENG_US.txt.json', localeVersion)
  }catch(e){
    console.error(e);
  }
}
