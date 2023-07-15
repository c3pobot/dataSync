'use strict'
const log = require('logger')
const fetch = require('helpers/fetch')
const mongo = require('mongoapiclient')
const path = require('path')
const S3_BUCKET = process.env.S3_BUCKET
const S3_API_URI = process.env.S3API_URI

const getRemoteList = async(dir)=>{
  try{
    if(!S3_BUCKET || !S3_API_URI ||!dir) throw('missing object storage info')
    return await fetch(path.join(S3_API_URI, 'list?Bucket='+S3_BUCKET+'&Prefix='+dir+'/'))
  }catch(e){
    throw(e)
  }
}
const checkImages = async(imgs = [], assetVersion, dir, collectionId)=>{
  try{
    let remoteList = await getRemoteList(dir)
    if(!remoteList) remoteList = []
    remoteList = remoteList.map(x=>x.Key)
    let missing = imgs.filter(x=>!remoteList?.includes(dir+'/'+x+'.png'))
    if(!missing) throw('Error determing missing assets for '+dir)
    log.info('Missing '+missing.length+' image for '+dir+'...')
    if(missing.length === 0) return
    await mongo.set('missingAssets', {_id: collectionId}, {imgs: missing, dir: dir, assetVersion: assetVersion})
    return
  }catch(e){
    log.error(e)
    setTimeout(()=>checkImages(imgs, assetVersion, dir, collectionId), 5000)
  }
}
module.exports = async(imgs = [], assetVersion, dir, collectionId)=>{
  try{
    if(imgs.length === 0 || !assetVersion || !dir || !collectionId) return
    checkImages(imgs, assetVersion, dir, collectionId)
  }catch(e){
    throw(e);
  }
}
