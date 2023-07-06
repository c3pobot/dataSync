'use strict'
const { readFile } = require('../helper')
const mongo = require('mongoapiclient')
module.exports = async(gameVersion, localeVersion, assetVersion)=>{
  try{
    let lang = await readFile('Loc_ENG_US.txt.json', localeVersion)
    let datacronTemplate = await readFile('datacronTemplate.json', gameVersion)
    let datacronSetList = await readFile('datacronSet.json', gameVersion)
    if(!lang || !datacronSetList || !datacronTemplate) return
    let timeNow = Date.now()
    let map = {}
    for(let i in datacronTemplate){
      let dataCronSet = datacronSetList.find(x=>x.id === datacronTemplate[i].setId)
      if(!dataCronSet) continue
      if(dataCronSet?.expirationTimeMs && +timeNow >= +dataCronSet.expirationTimeMs) continue
      map[datacronTemplate[i].setId] = {
        id: datacronTemplate[i].id,
        setId: datacronTemplate[i].setId,
        nameKey: lang[dataCronSet.displayName] || dataCronSet.displayName,
        expirationTimeMs: dataCronSet.expirationTimeMs,
        icon: dataCronSet.icon
      }
    }
    await mongo.set('configMaps', {_id: 'dataCronDefMap'}, {version: gameVersion, data: map})
    return true
  }catch(e){
    throw(e)
  }
}
