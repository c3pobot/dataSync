'use strict'
const { readFile } = require('../helper')

const getUnitMap = async(unitList = [], lang = {})=>{
  try{
    let res = {}
    for(let i in unitList){
      res[unitList[i].baseId] = lang[unitList[i].nameKey] || unitList[i].nameKey
    }
    if(Object.values(res)?.length > 0) return res
  }catch(e){
    throw(e);
  }
}
module.exports = async(gameVersion, localeVersion, assetVersion)=>{
  try{
    let unitGuideDefinition = await readFile('unitGuideDefinition.json', gameVersion)
    let unitList = await readFile('units.json', gameVersion)
    let lang = await readFile('Loc_ENG_US.txt.json', localeVersion)
    if(!unitGuideDefinition || !lang || !unitList) return
    let units = await getUnitMap(unitList.filter(x=>+x.rarity === 7 && x.obtainable === true && +x.obtainableTime === 0), lang)
    if(!units) return

    let autoComplete = []
    for(let i in unitGuideDefinition){
      if(!unitGuideDefinition[i].unitBaseId || !unitGuideDefinition[i].titleKey) return
      autoComplete.push({ name: units[unitGuideDefinition[i].unitBaseId] || lang[unitGuideDefinition[i].titleKey], value: unitGuideDefinition[i].unitBaseId, descKey: lang[unitGuideDefinition[i].titleKey] })
    }
    let manualGuides = (await mongo.find('botSettings', {_id: 'manualGuides'}))[0]
    if(manualGuides?.length > 0){
      for(let i in manualGuides){
        if(autoComplete.filter(x=>x.value === manualGuides[i].value).length === 0) autoComplete.push(manualGuides[i])
      }
    }
    if(autoComplete?.length > 0){
      await mongo.set('autoComplete', {_id: 'journey'}, {data: autoComplete, include: true})
      await mongo.set('autoComplete', {_id: 'nameKeys'}, {include: false, 'data.journey': 'journey'})
    }
    return true
  }catch(e){
    reportError(e);
  }
}
