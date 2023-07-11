'use strict'
const path = require('path')
const fetch = require('helpers/fetch')
const GITHUB_REPO_RAW_URL = process.env.GITHUB_REPO_RAW_URL || 'https://raw.githubusercontent.com/swgoh-utils/gamedata/main'
module.exports = async()=>{
  try{
    let res =  await fetch(path.join(GITHUB_REPO_RAW_URL, 'versions.json'))
    if(res) res = JSON.parse(res)
    if(!res) res = {}
    return res
  }catch(e){
    throw(e);
  }
}
