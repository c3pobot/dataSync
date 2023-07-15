'use strict'
const path = require('path')
const fetch = require('./fetch')
const S3_BUCKET = process.env.S3_BUCKET
const S3_API_URI = process.env.S3API_URI
const AE_URI = process.env.AE_URI
const FetchImage = async(thumbnailName, version)=>{
  try{
    if(!AE_URI || !thumbnailName || !version) return
    let assest = thumbnailName?.replace('tex.', '')
    let uri = 'Asset/single?forceReDownload=true&version='+version+'&assetName='+assest
    let res = await fetch(path.join(AE_URI, uri))
    if(res) return res.toString('base64')
  }catch(e){
    throw(e);
  }
}
const uploadFile = async(fileName, file)=>{
  try{
    if(!S3_API_URI || !S3_BUCKET || !fileName || !file) throw('missing object storage info')
    let body = { Key: fileName, Bucket: S3_BUCKET, Body: file }
    return await fetch(path.join(S3_API_URI, 'put'), 'POST', body, {'Content-Type': 'application/json'})
  }catch(e){
    throw(e);
  }
}
module.exports = async(version, thumbnailName, dir)=>{
  try{
    if(!version || !thumbnailName || !dir) return
    let img = await FetchImage(thumbnailName, version)
    if(!img) return
    return await uploadFile(path.join(dir, thumbnailName+'.png'), img)
  }catch(e){
    throw(e);
  }
}
