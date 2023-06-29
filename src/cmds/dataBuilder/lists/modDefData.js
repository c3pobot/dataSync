'use strict'
const { readFile } = require(baseDir+'/src/cmds/mapGameData/lists/helper')
module.exports = async(gameVersion, localeVersion)=>{
  try{
    let statModList = await readFile('statMod.json', gameVersion)
    if(!statModList) return
    let data = {}
    for(let i in statModList){
      data[statModList[i].id] = {
        rarity: statModList[i].rarity,
        slot: +statModList[i].slot,
        setId: +statModList[i].setId
      }
    }
    return data
  }catch(e){
    throw(e)
  }
}
