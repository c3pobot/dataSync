'use strict'
const ReadFile = require('./readFile')
const getSkillList = require('./getSkillList')
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
const getSkill = async(skillReference = [], data = {})=>{
  try{
    if(skillReference.length === 0) return
    let res = {}
    for(let i in skillReference){
      if(errored) continue;
      if(!data.skillMap[skillReference[i].skillId]) continue
      res[skillReference[i].skillId] = JSON.parse(JSON.stringify(data.skillMap[skillReference[i].skillId]))
    }
    if(!errored && Object.values(res)?.length > 0) return res
  }catch(e){
    setErrorFlag(e)
  }
}
const getCrewSkill = async(crew = [], data = {})=>{
  try{
    if(crew.length === 0) return
    let res = {}
    for(let i in crew){
      let crewSkill = await getSkill(crew[i].skillReference, data)
      if(crewSkill) res = { ...res, ...crewSkill }
    }
    if(!errored && Object.values(res)?.length > 0) return res
  }catch(e){
    setErrorFlag(e)
  }
}
const getOffenseStatId = async(abilityId, data = {})=>{
  try{
    if(!abilityId) return
    let ability = data.abilityList.find(x=>x.id === abilityId)
    if(!ability || ability.tier.length === 0) return
    let effects = ability.tier[+ability.tier.length - 1].effectReference
    if(effects) effects = effects.filter(x=>x.id.includes('damage'))
    if(effects?.length === 0) return
    let pd = 0, sd = 0
    for(let i in effects){
      let effect = data.effectList.find(x=>x.id === effects[i].id && x.multiplierAmountDecimal > 0)
      if(effect?.param?.filter(x=>x === 'ATTACK_DAMAGE').length > 0) pd++
      if(effect?.param?.filter(x=>x === 'ABILITY_POWER').length > 0) pd++
    }
    if(errored || (pd === 0 && sd === 0)) return
    if(sd > pd){
      return 7
    }else{
      return 6
    }
  }catch(e){
    setErrorFlag(e)
  }
}
module.exports = async(gameVersion, localeVersion, assetVersion)=>{
  try{
    errored = false
    let lang = await ReadFile('Loc_ENG_US.txt.json', localeVersion)
    let unitList = await ReadFile('units.json', gameVersion)
    let abilityList = await ReadFile('ability.json', gameVersion)
    let effectList = await ReadFile('effect.json', gameVersion)
    let skillMap = await getSkillList(gameVersion, localeVersion, assetVersion)
    let units = unitList?.filter(x=>+x.rarity === 7 && x.obtainable === true && +x.obtainableTime === 0)
    if(!lang || !units || !abilityList || !skillMap || units?.length === 0) return
    let autoComplete = [], unitMap = {}, gameData = { skillMap: skillMap, effectList: effectList, abilityList: abilityList }
    for(let i in units){
      if(errored) continue
      if(!lang[units[i].nameKey]) continue
      let alignment = u.categoryId.find(x=>x.startsWith('alignment_'))
      autoComplete.push({name: lang[units[i].nameKey], value: units[i].baseId, combatType: units[i].combatType})
      unitMap[units[i].baseId] = { baseId: units[i].baseId, nameKey: lang[units[i].nameKey], combatType: units[i].combatType, isGl: units[i].legend, alignment: alignment, icon: units[i].thumbnailName }
      let unit = {
        baseId: units[i].baseId,
        nameKey: lang[units[i].nameKey],
        combatType: units[i].combatType,
        thumbnailName: units[i].thumbnailName,
        categoryId: units[i].categoryId,
        alignment: alignment,
        crew: [],
        skill: {},
        ultimate: {},
        faction: {},
        isGL: units[i].legend
      }
      for(let f in unit[i].categoryId) unit.faction[unit[i].categoryId] = unit[i].categoryId;
      let offenseStatId = await getOffenseStatId(units[i].basicAttackRef?.abilityId, gameData)
      if(offenseStatId) unit.offenseStatId = offenseStatId
      if(unit[i].crew?.length > 0) unit.crew = units[i].crew?.map(x=>x.unitId)
      let skill = await getSkill(units[i].skillReference, gameData)
      if(skill) unit.skill = { ...unit.skill,...skill }
      let crewSkill = await getCrewSkill(units[i].crew, gameData)
      if(crewSkill) unit.skill = { ...unit.skill, ...crewSkill }
      let ultimate = await getSkill(units[i].limitBreakRef.filter(x=>x.powerAdditiveTag === 'ultimate'), gameData)
      if(ultimate) unit.ultimate = ultimate
      if(!errored) await mongo.set('unitList', {_id: units[u].baseId}, unit)
    }
    if(!errored && autoComplete.length > 0 && Object.values(unitMap)?.length > 0){
      await mongo.set('configMaps', {_id: 'unitMap'}, {data: unitMap})
      await mongo.set('autoComplete', {_id: 'unit'}, {data: autoComplete, include: true})
      await mongo.set('autoComplete', {_id: 'character'}, {data: autoComplete.filter(x=>x.combatType === 1), include: true})
      await mongo.set('autoComplete', {_id: 'ship'}, {data: autoComplete.filter(x=>x.combatType === 2), include: true})
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
