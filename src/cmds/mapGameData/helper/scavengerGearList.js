'use strict'
const { readFile, reportError } = require('./helper')
let errored = false
const setErrorFlag = (err)=>{
  try{
    errored = true
    reportError(err)
  }catch(e){
    errored = true
    console.error(e);
  }
}
const getConsumables = async(consumable = [], data = {})=>{
  try{
    let res = []
    if(consumable?.length === 0) return res
    for(let i in consumable){
      let item = data.equipmentList?.find(x=>x.id === consumable[i].id)
      if(!item) item = data.materialList?.find(x=>x.id === consumable[i].id)
      if(!item) continue
      res.push({id: consumable[i].id, nameKey: data.lang[item.nameKey] || item.nameKey, pointValue: consumable[i].pointValue})
    }
    return res
  }catch(e){
    setErrorFlag(e)
  }
}
module.exports = async(gameVersion, localeVersion, assetVersion)=>{
  try{
    errored = false
    let setList = await readFile('scavengerConversionSet.json', gameVersion)
    let equipmentList = await readFile('equipment.json', gameVersion)
    let materialList = await readFile('material.json', gameVersion)
    let lang = await readFile('Loc_ENG_US.txt.json', localeVersion)
    if(!setList || !lang || !equipmentList || !materialList) return
    
    let list = [], gameData = { lang: lang, equipmentList: equipmentList, materialList: materialList }
    for(let i in setList){
      let output = materialList.find(x=>x.id === setList[i].output?.item?.id)
      if(!output) output = equipmentList.find(x=>x.id === setList[i].output?.item?.id)
      if(!output) continue
      let tempObj = {id: setList[i].output.item.id, pointValue: setList[i].output.item.pointValue, nameKey: lang[output.nameKey] || output.nameKey), gear: []}
      tempObj.gear = await getConsumables(setList[i].consumable, gameData)
      if(!errored) await mongo.set('scavengerGearList', {_id: tempObj.id}, tempObj)
    }
    setList = null, equipmentList = null, materialList = null, lang = null
    if(!errored) return true
  }catch(e){
    reportError(e);
  }
}
