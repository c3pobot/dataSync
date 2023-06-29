'use strict'
const path = require('path')
const fetch = require('node-fetch')
const GITHUB_TOKEN = process.env.GITHUB_TOKEN
const GITHUB_REPO_URL = process.env.PRIVATE_GITHUB_REPO_URL
const USER_NAME = process.env.GITHUB_USER_NAME
const USER_EMAIL = process.env.GITHUB_USER_EMAIL
module.exports.push = async(data, fileName, commitMsg, sha)=>{
  try{
    if(!GITHUB_TOKEN || !GITHUB_REPO_URL || !data || !fileName || !commitMsg) return
    const headers = {
      Authorization: "Bearer "+GITHUB_TOKEN,
      'Content-Type': 'application/json'
    }
    const body = {
      committer: {name: USER_NAME, email: USER_EMAIL},
      message: commitMsg,
      content: data,
      sha: sha
    }
    const obj = await fetch(path.join(GITHUB_REPO_URL, fileName), {
      method: 'PUT',
      headers: headers,
      compress: true,
      body: JSON.stringify(body)
    })
    return await obj?.json()
  }catch(e){
    console.error(e);
  }
}
module.exports.getRepoFiles = async()=>{
  try{
    if(!GITHUB_TOKEN || !GITHUB_REPO_URL) return
    const headers = {
      Authorization: "Bearer "+GITHUB_TOKEN,
      'Content-Type': 'application/json'
    }
    const obj = await fetch(GITHUB_REPO_URL, {
      method: 'GET',
      headers: headers,
      compress: true
    })
    return await obj?.json()
  }catch(e){
    console.error(e);
  }
}
module.exports.get = async(fileName, files)=>{
  try{
    let file, data
    if(!GITHUB_REPO_URL || !GITHUB_TOKEN) return
    const headers = {
      Authorization: "Bearer "+GITHUB_TOKEN,
      'Content-Type': 'application/json'
    }
    if(!files) files = await Cmds.getRepoFiles()
    if(files?.length > 0) file = files.find(x=>x.name === fileName)
    if(!file?.download_url) return
    data = await fetch(file.download_url, {
      method: 'GET',
      headers: headers,
      compress: true
    })
    return await data?.json()
  }catch(e){
    console.error(e);
  }
}
