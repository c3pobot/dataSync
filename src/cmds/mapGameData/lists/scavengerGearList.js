'use strict'
const { readFile } = require('./helper')
const mongo = require('mongoapiclient')
const getConsumable = (consumable = [], data = {})=>{
  try{
    let res = {}
    if(consumable?.length === 0) return
    for(let i in consumable){
      let item = data.equipmentList?.find(x=>x.id === consumable[i].id)
      if(!item) item = data.materialList?.find(x=>x.id === consumable[i].id)
      if(!item) continue
      res[consumable[i].id] = {id: consumable[i].id, nameKey: data.lang[item.nameKey] || item.nameKey, pointValue: consumable[i].pointValue}
    }
    if(Object.values(res)?.length > 0) return res
  }catch(e){
    throw(e)
  }
}
module.exports = async(gameVersion, localeVersion, assetVersion)=>{
  try{
    let setList = await readFile('scavengerConversionSet.json', gameVersion)
    let equipmentList = await readFile('equipment.json', gameVersion)
    let materialList = await readFile('material.json', gameVersion)
    let lang = await readFile('Loc_ENG_US.txt.json', localeVersion)
    if(!setList || !lang || !equipmentList || !materialList) return

    let gameData = { lang: lang, equipmentList: equipmentList, materialList: materialList }
    for(let i in setList){
      let output = materialList.find(x=>x.id === setList[i].output?.item?.id)
      if(!output) output = equipmentList.find(x=>x.id === setList[i].output?.item?.id)
      if(!output) continue
      let tempObj = {id: setList[i].output.item.id, pointValue: setList[i].output.item.pointValue, nameKey: lang[output.nameKey] || output.nameKey, gear: []}
      let gearList = getConsumable(setList[i].consumable, gameData)
      if(gearList){
        tempObj.gear = gearList
        await mongo.set('scavengerGearList', {_id: tempObj.id}, tempObj)
      }
    }
    setList = null, equipmentList = null, materialList = null, lang = null
    return true
  }catch(e){
    throw(e);
  }
}
