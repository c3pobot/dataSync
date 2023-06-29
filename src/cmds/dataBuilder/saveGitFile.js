'use strict'
const gitHubClient = require('./gitHubClient')
module.exports = async(data, fileName, commitMsg, sha)=>{
  try{
    if(!data || !fileName || !commitMsg) return
    let obj = Buffer.from(JSON.stringify(data)).toString('base64')
    if(obj) return await gitHubClient.push(obj, fileName, commitMsg, sha)
  }catch(e){
    console.error(e);
  }
}
