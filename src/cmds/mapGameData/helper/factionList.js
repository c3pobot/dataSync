'use strict'
const { readFile, reportError } = require('./helper')
const altName = {'species_wookiee_ls': 'Light Side Wookiee'}
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
const mapFaction = (categoryList = [], lang = {})=>{
  try{
    let list = {}
    categoryList.forEach(f=>{
      list[f.id] = {
        id: f.id,
        nameKey: altName[f.id] || lang[f.descKey],
        uiFilter: (f.uiFilter?.length > 0 ? true:false),
        visible: f.visible,
        units:[]
      }
    })
    if(!errored && Object.values(list).length > 0) return list
  }catch(e){
    setErrorFlag(e)
  }
}
const mapUnit = (unitList = [])=>{
  try{
    if(unitList.length === 0) return
    let res = {}
    for(let i in units){
      for(let f in units[i].categoryId){
        if(!res[units[i].categoryId[f]]) res[categoryId] = []
        res[categoryId].push(unit[i].baseId)
      }
    }
    if(!errored) return res
  }catch(e){
    setErrorFlag(e)
  }
}
module.exports = async(gameVersion, localeVersion, assetVersion)=>{
  try{
    errored = false
    let lang = await readFile('Loc_ENG_US.txt.json', localeVersion)
    let unitList = await readFile('units.json', gameVersion)
    let factionList = await readFile('category.json', gameVersion)
    if(unitList) unitList = unitList.filter(x=>+x.rarity === 7 && x.obtainable === true && +x.obtainableTime === 0)
    if(!unitList || !lang !! !categoryList || unitList?.length === 0) return
    let factionMap = mapFaction(factionList, lang)
    let unitMap = mapUnit(unitList)
    if(!factionMap || !unitMap) return

    let autoComplete = [], map = {}
    for(let i in factionMap){
      if(errored) continue
      factionMap[i].units = unitMap[factionMap[i].id] || []
      if(!factionMap[i].id.startsWith('special') && factionMap[i].nameKey && factionMap[i].nameKey !== 'Placeholder' && factionMap[i].uiFilter){
        if(factionMap[i].units.length === 0) continue
        autoComplete.push({name: nameKey, value: factionMap[i].id})
        map[factionList[i].id] = {id: factionMap[i].id, nameKey: nameKey}
        await mongo.set('factionList', {_id: factionMap[i].id}, factionMap[i])
      }else{
        if(factionMap[i].id) await mongo.set('hiddenFactionList', {_id: factionMap[i].id}, factionMap[i])
      }
    }
    if(!errored && autoComplete.length > 0 && Object.values(map)?.length > 0){
      await mongo.set('autoComplete', {_id: 'faction'}, {include: true, data: unitsAutoComplete})
      await mongo.set('configMaps', {_id: 'factionMap'}, {data: map})
      await mongo.set('autoComplete', {_id: 'nameKeys'}, {include: false, 'data.faction': 'faction'} )
    }
    lang = null, unitList = null, factionList = null, factionMap = null, unitMap = null
    if(!errored) return true
  }catch(e){
    reportError(e);
  }
}
