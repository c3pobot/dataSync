'use strict'
const ReadFile = require('./readFile')
let errored = false
const setErrorFlag = (err)=>{
  try{
    errored = true
    console.error(err)
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
    let setList = await ReadFile('scavengerConversionSet.json', gameVersion)
    let equipmentList = await ReadFile('equipment.json', gameVersion)
    let materialList = await ReadFile('material.json', gameVersion)
    let lang = await ReadFile('Loc_ENG_US.txt.json', localeVersion)
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
    if(!errored) return true
  }catch(e){
    console.error(e);
  }
}
