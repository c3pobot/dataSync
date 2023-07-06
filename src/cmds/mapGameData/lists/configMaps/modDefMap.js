'use strict'
const { readFile } = require('../helper')
const mongo = require('mongoapiclient')
module.exports = async(gameVersion, localeVersion)=>{
  try{
    let statModList = await readFile('statMod.json', gameVersion)
    if(!statModList) return
    let data = {}
    for(let i in statModList){
      data[statModList[i].id] = {
        defId: statModList[i].id,
        rarity: statModList[i].rarity,
        slot: +statModList[i].slot,
        setId: +statModList[i].setId
      }
    }
    await mongo.set('configMaps', {_id: 'modDefMap'}, {version: gameVersion, data: data})
    return true
  }catch(e){
    throw(e)
  }
}
