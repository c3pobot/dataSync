'use strict'
const path = require('path')
const fs = require('fs')
const Fetch = require('../fetch')
const ReadFile = require('../readFile')
const dataUrl = process.env.GITHUB_DATA_URI || 'https://raw.githubusercontent.com/swgoh-utils/gamedata/main'

const Checkfile = async(file, version)=>{
  try{
    if(!file || !version) return
    let obj = await ReadFile(path.join(baseDir, 'data', file))
    if(obj?.version === version){
      obj = null
      return true
    }
  }catch(e){
    console.error(e)
  }
}
const SaveFile = async(file, version)=>{
  try{
    const fileExists = await Checkfile(file, version)
    if(fileExists) return true
    let obj = await Fetch.json(path.join(dataUrl, file), 'GET')
    if(obj?.data && obj?.version === version){
      await fs.writeFileSync(path.join(baseDir, 'data', file), JSON.stringify(obj))
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
    if(versions) totalCount = Object.values(versions)?.filter(x=>x === gameVersion)?.length
    if(+totalCount === 0) return false
    count++;
    for(let i in versions){
      if(versions[i] === gameVersion && i !== 'gameVersion'){
        const status = await SaveFile(i, gameVersion)
        if(status === true) count++;
      }
    }
    if(count !== +totalCount) return false
    return await SaveFile('Loc_ENG_US.txt.json', localeVersion)
  }catch(e){
    console.error(e);
  }
}
