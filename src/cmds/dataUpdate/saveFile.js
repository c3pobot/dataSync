const log = require('logger')
const path = require('path')
const fs = require('fs')
const fetch = require('helpers/fetch')
const DATA_PATH = process.env.DATA_PATH || path.join(baseDir, 'data')
const s3client = require('s3client')
const S3_BUCKET = process.env.S3_DATA_BUCKET || 'gamedata'

const ReadFile = async(file)=>{
  try{
    const obj = fs.readFileSync(path.join(DATA_PATH, file))
    if(obj) return JSON.parse(obj)
  }catch(e){
    log.info('error reading '+file)
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
    let obj = await s3client.get(S3_BUCKET, file)
    if(obj?.data && obj?.version === version){
      await fs.writeFileSync(path.join(DATA_PATH, file), JSON.stringify(obj))
      return true
    }
  }catch(e){
    throw(e);
  }
}
