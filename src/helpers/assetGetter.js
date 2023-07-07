const mongo = require('mongoapiclient')
const path = require('path')
const imagesToIgnore = require('./imagestoignore.json')
const SaveImage = require('./saveImage')
const checkAssetName = (img)=>{
  try{
    if(!img) return
    if(img.startsWith('icon_stat_')) return;
    return true
  }catch(e){
    throw(e);
  }
}
const checkMissing = async()=>{
  try{
    let list = await mongo.find('missingAssets', {})
    if(list?.length > 0){
      let i = list.length
      while(i--) await saveImages(list[i].imgs, list[i].assetVersion, list[i].dir, list[i]._id)
    }
    setTimeout(checkMissing, 30000)
  }catch(e){
    console.error(e);
    setTimeout(checkMissing, 5000)
  }
}
const saveImages = async(imgs = [], assetVersion, dir, collectionId)=>{
  try{
    if(imgs.length === 0 || !assetVersion || !dir) return
    let errored = []
    console.log('trying download of '+imgs.length+' images for version '+assetVersion+' to '+dir+' for '+collectionId+'...')
    let i = imgs.length
    while(i--){
      if(imagesToIgnore.filter(x=>x === imgs[i]).length > 0) continue
      let status = await checkAssetName(imgs[i])
      if(!status) continue
      status = await SaveImage(assetVersion, imgs[i], dir)
      if(!status?.ETag) errored.push(imgs[i])
    }
    if(errored.length > 0){
      console.log('Missing '+errored.length+' images for version '+assetVersion+' in '+dir+' for '+collectionId+'...')
      await mongo.set('missingAssets', {_id: collectionId}, {imgs: errored, dir: dir, assetVersion: assetVersion})
    }else{
      await mongo.del('missingAssets', {_id: collectionId})
      console.log('Saved '+imgs?.length+' images for version '+assetVersion+' to '+dir+' for '+collectionId+'...')
    }
  }catch(e){
    throw(e)
  }
}
checkMissing()
