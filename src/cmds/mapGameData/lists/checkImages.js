const log = require('logger')
'use strict'
const fs = require('fs')
const mongo = require('mongoapiclient')
const path = require('path')
const PUBLIC_DIR = process.env.PUBLIC_DIR || path.join(baseDir, 'public')
const getFileNames = (dir)=>{
  return new Promise((resolve, reject) =>{
    try{
      fs.readdir(dir, (err, files)=>{
        if(err) reject(err);
        resolve(files)
      })
    }catch(e){
      reject(e)
    }
  })
}

module.exports = async(imgs = [], assetVersion, dir, collectionId)=>{
  try{
    if(imgs.length === 0 || !assetVersion || !dir || !collectionId) return
    let errored = []
    let assets = await getFileNames(path.join(PUBLIC_DIR, dir))
    let missingAssets = imgs?.filter(x=>!assets?.includes(x+'.png'))
    log.info('Missing: '+missingAssets.length)
    if(!missingAssets || missingAssets.length === 0) return
    await mongo.set('missingAssets', {_id: collectionId}, {imgs: missingAssets, dir: dir, assetVersion: assetVersion})
  }catch(e){
    throw(e);
  }
}
