'use strict'
const path = require('path')
const PUBLIC_DIR = process.env.PUBLIC_DIR || path.join(baseDir, 'public')
const SaveImage = require('../saveImage')
const getFileNames = (dir)=>{
  return new Promise(resolve =>{
    try{
      fs.readdir(dir, (err, files)=>{
        if(err) console.error(err);
        resolve(files)
      })
    }catch(e){
      setErrorFlag(e)
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
module.exports = async(imgs = [], assetVersion, dir)=>{
  try{
    if(imgs.length === 0 || !assetVersion || !dir) return
    let assests = await getFileNames(path.join(PUBLIC_DIR, dir))
    let missingAssets = imgs?.filter(x=>!assests?.includes(x+'.png'))
    if(!missingAssets || missingAssets.length === 0) return
    for(let i in missingAssets){
      let status = await checkAssetName(missingAssets[i])
      if(!status) continue
      await SaveImage(assetVersion, missingAssets[i], dir)
    }
  }catch(e){
    console.error(e);
  }
}
