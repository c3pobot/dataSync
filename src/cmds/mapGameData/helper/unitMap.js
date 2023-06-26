'use strict'
const ReadFile = require('./readFile')
module.exports = async(gameVersion, localeVersion, assetVersion)=>{
  try{
    let lang = await ReadFile('Loc_ENG_US.txt.json', localeVersion)
    let unitList = await ReadFile('units.json', gameVersion)
    if(unitList) unitList = unitList.filter(+u=>u.rarity === 7 && u.obtainable === true && +u.obtainableTime === 0)
    if(!lang || !unitList || unitList?.length === 0) return
    let autoComplete = [], unitMap = {}, character = [], ship = []
    unitlist.forEach(u=>{
      if(!lang[u.nameKey]) return
      let isGl = u.categoryId.find(x=>x === 'galactic_legend')
      let alignment = u.categoryId.find(x=>x.startsWith('alignment_'))
      autoComplete.push({name: lang[u.nameKey], value: u.baseId, combatType: u.combatType})
      unitMap[u.baseId] = { baseId: u.baseId, nameKey: lang[u.nameKey], combatType: u.combatType, isGl: (isGl ? true:false), alignment: alignment, icon: u.thumbnailName }
    })
    if(autoComplete.length > 0 && Object.values(unitMap)?.length > 0){
      await mongo.set('configMaps', {_id: 'unitMap'}, {data: unitMap})
      await mongo.set('autoComplete', {_id: 'character'}, {data: autoComplete.filter(x=>x.combatType === 1), include: true})
      await mongo.set('autoComplete', {_id: 'ship'}, {data: autoComplete.filter(x=>x.combatType === 2), include: true})
      await mongo.set('autoComplete', {_id: 'ship'}, {data: autoComplete, include: true})
      await mongo.set('autoComplete', {_id: 'nameKeys'}, {
        include: false,
        'data.unit': 'unit',
        'data.unit1': 'unit',
        'data.unit2': 'unit',
        'data.leader': 'unit',
        'data.character': 'character',
        'data.ship': 'ship'
      }
      return true
    }
  }catch(e){
    console.error(e);
  }
}
