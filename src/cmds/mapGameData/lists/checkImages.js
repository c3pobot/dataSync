'use strict'
const path = require('path')
const PUBLIC_DIR = process.env.PUBLIC_DIR || path.join(baseDir, 'public')
const { v4: uuidv4 } = require('uuid')
const SaveImage = require('../saveImage')
const imagesToIgnore = require('./maps/imagestoignore.json')
const checkForMissingAssets = async()=>{
  try{
    if(mongoReady){
      let list = await mongo.find('missingAssets', {})
      if(list?.length > 0){
        for(let i in list) await saveImages(list[i].imgs, list[i].assetVersion, list[i].dir, list[i]._id)
      }
    }
    setTimeout(checkForMissingAssets, 30000)
  }catch(e){
    console.error(e);
    setTimeout(checkForMissingAssets, 5000)
  }
}
const getFileNames = (dir)=>{
  return new Promise(resolve =>{
    try{
      fs.readdir(dir, (err, files)=>{
        if(err) console.error(err);
        resolve(files)
      })
    }catch(e){
      resolve()
    }
  })
}
const checkAssetName = (img)=>{
  try{
    if(!img) return
    if(img.startsWith('icon_stat_')) return;
    return true
  }catch(e){
    console.error(e);
  }
}
const uploadErroredFiles = (imgs = [], assetVersion, dir)=>{
  try{
    saveImages(imgs = [], assetVersion, dir)
  }catch(e){
    console.error(e);
  }
}
const saveImages = async(imgs = [], assetVersion, dir, collectionId)=>{
  try{
    if(imgs.length === 0 || !assetVersion || !dir) return
    let errored = []
    console.log('trying download of '+imgs.length+' images for version '+assetVersion+' to '+dir+' for '+collectionId+'...')
    for(let i in imgs){
      if(imagesToIgnore.filter(x=>x === imgs[i]).length > 0) continue
      let status = await checkAssetName(imgs[i])
      if(!status) continue
      status = await SaveImage(assetVersion, imgs[i], dir)
      if(!status?.ETag) errored.push(imgs[i])
    }
    if(errored.length > 0){
      console.log('Missing '+errored.length+' images for version '+assetVersion+' in '+dir+' for '+collectionId+'...')
      if(collectionId){
        await mongo.set('missingAssets', {_id: collectionId}, {imgs: errored, dir: dir, assetVersion: assetVersion})
      }else{
        setTimeout(()=>uploadErroredFiles(errored, assetVersion, dir), 10000)
      }
    }else{
      await mongo.del('missingAssets', {_id: collectionId})
      console.log('Saved '+imgs?.length+' images for version '+assetVersion+' to '+dir+' for '+collectionId+'...')
    }
  }catch(e){
    console.error(e);
  }
}
checkForMissingAssets()
module.exports = async(imgs = [], assetVersion, dir, collectionId)=>{
  try{
    if(imgs.length === 0 || !assetVersion || !dir) return
    let errored = []
    let assests = await getFileNames(path.join(PUBLIC_DIR, dir))
    let missingAssets = imgs?.filter(x=>!assests?.includes(x+'.png'))
    if(!missingAssets || missingAssets.length === 0) return
    let key = collectionId
    if(!key) key = uuidv4()
    if(key){
      await mongo.set('missingAssets', {_id: key}, {imgs: imgs, dir: dir, assetVersion: assetVersion})
    }else{
      setTimeout(()=>uploadErroredFiles(errored, assetVersion, dir), 10000)
    }
  }catch(e){
    console.error(e);
  }
}
