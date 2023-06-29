'use strict'
const path = require('path')
const fileArray = require('./fileArray')
const readFile = require('./readFile')

module.exports = async(gameVersion, localeVersion, forceFile = false)=>{
  try{
    let count = 0, res = {}
    for(let i in fileArray){
      let version = gameVersion
      if(fileArray[i].version === 'localeVersion') version = localeVersion
      let file = await readFile(fileArray[i].name+'.json', version)
      const status = await SaveFile(fileArray[i], gameVersion, forceFile)
      if(status){
        res[fileArray[i].name] = file
        count++;
      }
    }
    if(count === 0 || count === +fileArray?.length){
      return res
    }else{
      throw('files for gameData are not updated yet...')
    }
  }catch(e){
    console.error(e);
  }
}
