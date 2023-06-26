'use strict'
const fs = require('fs')
const path = require('path')
const Fetch = require('../../fetch')
const PUBLIC_DIR = process.env.PUBLIC_DIR || path.join(baseDir, 'public')
const S3_BUCKET = process.env.S3_BUCKET || 'web-public'
const S3_API_URI = process.env.S3API_URI
const AE_URI = process.env.AE_URI
const FetchImage = async(thumbnailName, version)=>{
  try{
    if(!AE_URI || !thumbnailName || !version) return
    let assest = thumbnailName?.replace('tex.', '')
    let uri = 'Asset/single?forceReDownload=true&version='+version+'&assetName='+imageName
    return await Fetch.image(path.join(AE_URI, uri))
  }catch(e){
    console.error(e);
  }
}
const SaveFile = async(dir, fileName, data, encoding = 'base64')=>{
  try{
    return await fs.writeFileSync(path.join(PUBLIC_DIR, dir, fileName), data, {encoding: encoding})
  }catch(e){
    console.error(e);
  }
}
const uploadFile = async(fileName, file)=>{
  try{
    if(!S3_API_URI || !S3_BUCKET || fileName || file) return
    let body = { Key: fileName, Bucket: S3_BUCKET, Body: file, Convert: 'base64'}
    return await Fetch.json(path.join(S3_API_URI, 'put'), 'POST', body, {'Content-Type': 'application/json'})
  }catch(e){
    console.error(e);
  }
}
module.exports = async(version, thumbnailName, dir)=>{
  try{
    if(!version || !thumbnailName || !dir) return
    let img = await FetchImage(thumbnailName, version)
    if(!img) return
    let status = await uploadFile(path.join(dir, thumbnailName+'.png'), img)
    console.log(status)
  }catch(e){
    console.error(e);
  }
}
