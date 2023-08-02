'use strict'
const path = require('path')
const fetch = require('helpers/fetch')
const s3client = require('s3client')
const S3_BUCKET = process.env.S3_DATA_BUCKET || 'gamedata'
//const GITHUB_REPO_RAW_URL = process.env.GITHUB_REPO_RAW_URL || 'https://raw.githubusercontent.com/swgoh-utils/gamedata/main'

module.exports = async()=>{
  try{
    let res = await s3client.get(S3_BUCKET, 'versions.json')
    if(!res) res = {}
    return res
  }catch(e){
    throw(e);
  }
}
