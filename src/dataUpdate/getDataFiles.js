'use strict'
const path = require('path')
const fs = require('fs')
const Fetch = require('../fetch')
const dataUrl = process.env.GITHUB_DATA_URI || 'https://raw.githubusercontent.com/swgoh-utils/gamedata/main'
const SaveFile = async(file, version)=>{
  try{
    let obj = await Fetch.json(path.join(dataUrl, file), 'GET')
    if(obj?.data && obj?.version === version){
      await fs.writeFileSync(path.join(baseDir, 'data', file), JSON.stringify(obj.data))
      return true
    }
  }catch(e){
    console.error(e);
  }
}
module.exports = async(gameVersion, localeVersion)=>{
  try{
    let count = 0, totalCount = 0
    const versions = await Fetch.json(path.join(dataUrl, 'versions.json'), 'GET')
    if(version) totalCount = Object.values(version)?.filter(x=>x === gameVersion)
    if(totalCount === 0) return false
    count++;
    for(let i in versions){
      if(versions[i] === gameVersion && i !== 'gameVersion'){
        const status = await SaveFile(i)
        if(status === true) count++;
      }
    }
    if(count !== totalCount) return false
    return await SaveFile('Loc_ENG_US.txt.json', localeVersion)
  }catch(e){
    console.error(e);
  }
}
