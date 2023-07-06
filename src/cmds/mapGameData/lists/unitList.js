'use strict'
const { getSkillMap, readFile, getOffenseStatId, getSkill, getCrewSkill, getUltimate, checkUnitImages } = require('./helper')
const nameKeyPayload = {include: false, 'data.unit': 'unit', 'data.unit1': 'unit', 'data.unit2': 'unit', 'data.leader': 'unit', 'data.character': 'character', 'data.ship': 'ship'}
const mongo = require('mongoapiclient')
module.exports = async(gameVersion, localeVersion, assetVersion)=>{
  try{
    let lang = await readFile('Loc_ENG_US.txt.json', localeVersion)
    let abilityList = await readFile('ability.json', gameVersion)
    let skillList = await readFile('skill.json', gameVersion)
    let skillMap = await getSkillMap(skillList, abilityList, lang)

    let unitList = await readFile('units.json', gameVersion)
    let effectList = await readFile('effect.json', gameVersion)
    let units = unitList?.filter(x=>+x.rarity === 7 && x.obtainable === true && +x.obtainableTime === 0)

    if(!lang || !abilityList || !skillMap || !effectList || !units || units?.length === 0) return

    let autoComplete = [], unitMap = {}, images=[], gameData = { lang: lang, abilityList: abilityList, effectList: effectList, skillMap: skillMap  }

    for(let i in units){
      let u = units[i]
      if(!lang[u.nameKey]) continue
      if(images.filter(x=>x === u.thumbnailName).length === 0) images.push(u.thumbnailName)
      let alignment = u.categoryId.find(x=>x.startsWith('alignment_'))
      autoComplete.push({name: lang[u.nameKey], value: u.baseId, combatType: u.combatType})
      unitMap[u.baseId] = { baseId: u.baseId, nameKey: lang[u.nameKey], combatType: u.combatType, isGl: u.legend, alignment: alignment, icon: u.thumbnailName }
      let unit = {
        baseId: u.baseId,
        nameKey: lang[u.nameKey],
        combatType: u.combatType,
        icon: u.thumbnailName,
        categoryId: u.categoryId,
        alignment: alignment,
        crew: [],
        skill: {},
        ultimate: {},
        faction: {},
        isGL: u.legend
      }
      for(let f in u.categoryId) unit.faction[u.categoryId[f]] = u.categoryId[f];
      let offenseStatId = await getOffenseStatId(u.basicAttackRef?.abilityId, gameData)
      if(offenseStatId) unit.offenseStatId = offenseStatId
      if(u.crew?.length > 0) unit.crew = u.crew?.map(x=>x.unitId)
      let skill = await getSkill(u.skillReference, gameData)
      if(skill) unit.skill = { ...unit.skill,...skill }
      let crewSkill = await getCrewSkill(u.crew, gameData)
      if(crewSkill) unit.skill = { ...unit.skill, ...crewSkill }
      let ultimate = await getUltimate(u.limitBreakRef.filter(x=>x.powerAdditiveTag === 'ultimate'), gameData)
      if(ultimate) unit.ultimate = ultimate
      await mongo.set('unitList', {_id: unit.baseId}, unit)
    }
    if(images?.length > 0){
      checkUnitImages(images, assetVersion)
    }
    if(autoComplete.length > 0 && Object.values(unitMap)?.length > 0){
      await mongo.set('configMaps', {_id: 'unitMap'}, {data: unitMap})
      await mongo.set('autoComplete', {_id: 'unit'}, {data: autoComplete, include: true})
      await mongo.set('autoComplete', {_id: 'character'}, {data: autoComplete.filter(x=>x.combatType === 1), include: true})
      await mongo.set('autoComplete', {_id: 'ship'}, {data: autoComplete.filter(x=>x.combatType === 2), include: true})
      await mongo.set('autoComplete', {_id: 'nameKeys'}, nameKeyPayload)
    }
    lang = null, abilityList = null, skillList = null, skillMap = null, unitList = null, effectList = null, units = null
    if(autoComplete.length > 0) return true
  }catch(e){
    throw(e);
  }
}
