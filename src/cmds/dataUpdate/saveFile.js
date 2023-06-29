const path = require('path')
const fs = require('fs')
const Fetch = require('../fetch')
const DATA_PATH = process.env.DATA_PATH || path.join(baseDir, 'data')
const dataUrl = process.env.GITHUB_DATA_URI || 'https://raw.githubusercontent.com/swgoh-utils/gamedata/main'
const ReadFile = async(file)=>{
  try{
    const obj = fs.readFileSync(path.join(DATA_PATH, file))
    if(obj) return JSON.parse(obj)
  }catch(e){
    console.log('error reading '+file)
  }
}
const Checkfile = async(file, version)=>{
  try{
    let obj = await ReadFile(file)
    if(obj?.version === version){
      obj = null
      return true
    }
  }catch(e){
    throw(e)
  }
}
module.exports = async(file, version, forceFile = false)=>{
  try{
    if(!file || !version) return false
    if(!forceFile){
      const fileExists = await Checkfile(file, version)
      if(fileExists) return true
    }
    let obj = await Fetch.json(path.join(dataUrl, file), 'GET')
    if(obj?.data && obj?.version === version){
      await fs.writeFileSync(path.join(DATA_PATH, file), JSON.stringify(obj))
      return true
    }
  }catch(e){
    cthrow(e);
  }
}
