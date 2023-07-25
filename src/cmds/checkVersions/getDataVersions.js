'use strict'
const path = require('path')
const fetch = require('helpers/fetch')
const S3_API_URI = process.env.S3_API_URI
const S3_BUCKET = process.env.S3_DATA_BUCKET || 'gamedata'
//const GITHUB_REPO_RAW_URL = process.env.GITHUB_REPO_RAW_URL || 'https://raw.githubusercontent.com/swgoh-utils/gamedata/main'

module.exports = async()=>{
  try{
    let res = await fetch(path.join(S3_API_URI, 'get?Bucket='+S3_BUCKET+'&Key=versions.json'))
    if(!res) res = {}
    return res
  }catch(e){
    throw(e);
  }
}
