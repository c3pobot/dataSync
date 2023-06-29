'use strict'
const { readFile } = require('./helper')
const altName = {'species_wookiee_ls': 'Light Side Wookiee'}
let errored = false
const getFactionMap = (categoryList = [], lang = {})=>{
  try{
    let res = {}
    for(let i in categoryList){
      res[categoryList[i].id] = {
        id: categoryList[i].id,
        nameKey: altName[categoryList[i].id] || lang[categoryList[i].descKey],
        uiFilter: (categoryList[i].uiFilter?.length > 0 ? true:false),
        visible: categoryList[i].visible,
        units: []
      }
    }
    if(!errored && Object.values(res).length > 0) return res
  }catch(e){
    throw(e)
  }
}
const getUnitMap = (unitList = [])=>{
  try{
    if(unitList.length === 0) return
    let res = {}
    for(let i in unitList){
      for(let f in unitList[i].categoryId){
        if(!res[unitList[i].categoryId[f]]) res[unitList[i].categoryId[f]] = []
        res[unitList[i].categoryId[f]].push(unitList[i].baseId)
      }
    }
    if(!errored) return res
  }catch(e){
    throw(e)
  }
}
module.exports = async(gameVersion, localeVersion, assetVersion)=>{
  try{
    errored = false
    let lang = await readFile('Loc_ENG_US.txt.json', localeVersion)
    let unitList = await readFile('units.json', gameVersion)
    let categoryList = await readFile('category.json', gameVersion)
    if(unitList) unitList = unitList.filter(x=>+x.rarity === 7 && x.obtainable === true && +x.obtainableTime === 0)
    if(!unitList || !lang || !categoryList || unitList?.length === 0) return
    let factionMap = getFactionMap(categoryList, lang)
    let unitMap = getUnitMap(unitList)
    if(!factionMap || !unitMap) return

    let autoComplete = [], map = {}
    for(let i in factionMap){
      if(errored) continue
      factionMap[i].units = unitMap[factionMap[i].id] || []
      if(!factionMap[i].id.startsWith('special') && factionMap[i].nameKey && factionMap[i].nameKey !== 'Placeholder' && factionMap[i].uiFilter){
        if(factionMap[i].units.length === 0) continue
        autoComplete.push({name: factionMap[i].nameKey, value: factionMap[i].id})
        map[factionMap[i].id] = {id: factionMap[i].id, nameKey: factionMap[i].nameKey}
        await mongo.set('factionList', {_id: factionMap[i].id}, factionMap[i])
      }else{
        if(factionMap[i].id) await mongo.set('hiddenFactionList', {_id: 'missing/'+factionMap[i].id}, factionMap[i])
      }
    }
    if(!errored && autoComplete.length > 0 && Object.values(map)?.length > 0){
      await mongo.set('autoComplete', {_id: 'faction'}, {include: true, data: autoComplete})
      await mongo.set('autoComplete', {_id: 'factionMap'}, {data: map})
      await mongo.set('autoComplete', {_id: 'nameKeys'}, {include: false, 'data.faction': 'faction'} )
    }
    lang = null, unitList = null, categoryList = null, factionMap = null, unitMap = null
    if(!errored) return true
  }catch(e){
    throw(e);
  }
}
