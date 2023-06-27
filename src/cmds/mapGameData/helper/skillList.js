'use strict'
const ReadFile = require('./readFile')
const enumDamageType = { MAX_HEALTH: 1, ATTACK_DAMAGE: 6, ABILITY_POWER: 7 }
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
const getAbilityMap = async(abilityList = [], lang = {})=>{
  try{
    let list = {}
    abilityList.forEach(a=>{
      if(!lang[a.nameKey]) return
      list[a.id] = {
        abilityId: a.id,
        nameKey: lang[a.nameKey],
        descKey: lang[a.descKey],
        isZeta: false,
        isOmi: false,
        tier: a.tier
      }
      if(a.tier?.filter(x=>x.isZetaTier).length > 0) list[a.id].isZeta = true
      if(a.tier?.filter(x=>x.isOmicronTier).length > 0) list[a.id].isOmi = true
    })
    if(!errored) return list
  }catch(e){
    setErrorFlag(e)
  }
}
const getSkillMap = async(skillList = [], abilityMap = {})=>{
  try{
    let list = {}
    skillList.forEach(s=>{
      list[s.id] = JSON.parse(JSON.stringify(abilityMap[s.abilityReference]))
    })
    if(!errored) return list
  }catch(e){
    setErrorFlag(e)
  }
}
const getDamageType = (param = [])=>{
  try{
    let res
    if(param.length === 0) return res
    for(let i in param){
      if(enumDamageType[param[i]]) res = enumDamageType[param[i]]
      if(res > 0) break;
    }
    if(!errored && res) return res
  }catch(e){
    setErrorFlag()
  }
}
const getEffectReference = async(effectReference = [], data = {})=>{
  try{
    let res = []
    if(effectReference?.length === 0) return
    for(let i in effectReference){
      let effect = data.effectList?.find(x=>x.id === effectReference[i].id)
      if(!effect || (effect?.multiplierAmountDecimal === 0 && !effect?.summonId)) continue;
      let tempObj = {id: effect.id, param: effect.param, multiplierAmountDecimal: effect.multiplierAmountDecimal, resultVarianceDecimal: effect.resultVarianceDecimal, summonId: effect.summonId, summonEffectList: effect.summonEffectList}
      let damageType = await getDamageType(effect.param)
      if(damageType) tempObj.damageType = damageType
      if(tempObj.damageType || tempObj.summonId) res.push(tempObj)
    }
    if(!errored && res.length > 0) return res
  }catch(e){
    setErrorFlag(e)
  }
}
const getAbillityDamage = async(tier = [], data)=>{
  try{
    let res = []
    if(tier.length === 0) return res
    for(let i in tier){
      let tempObj = await getEffect(tiers[i].effectReference, data)
      if(tempObj) res = res.concat(tempObj)
    }
    if(!errored) return res
  }catch(e){
    setErrorFlag(e)
  }
}
const getSkill = async(skillReference = [], data = {})=>{
  try{
    let res = {}
    if(skillReference.length === 0) return []
    for(let i in skillReference){
      if(!skillMap[skillReference[i].skillId]) continue;
      res[skillReference[i].skillId] = skillMap[skillReference[i].skillId]
      let abilityDamage = await getAbillityDamage(skillReference[i].tier, data)
    }
    if(!errored) return Object.values(res)
  }catch(e){
    setErrorFlag(e)
  }
}
const getCrewSkill = async(crew = [], data = {})=>{
  try{
    if(crew?.length === 0) return
    let res = []
    for(let i in crew){
      let skill = await getSkill(crew[i].skillReference, data)
      if(skill) res = res.concat(skill)
    }
    if(!errored && res?.length > 0) return res
  }catch(e){
    setErrorFlag(e)
  }
}
module.exports = async(gameVersion, localeVersion, assetVersion)=>{
  try{
    errored = false
    let lang = await ReadFile('Loc_ENG_US.txt.json', localeVersion)
    let abilityList = ReadFile('ability.json', gameVersion)
    if(!lang || abilityList) return
    let abilityMap = await getAbilityMap(abilityList, lang)
    let skillList = await ReadFile('skill.json', gameVersion)
    if(!abilityMap || !skillList) return
    let skillMap = await getSkillMap(skillList, abilityMap)
    let unitList = await ReadFile('units.json', gameVersion)
    let effectList = await ReadFile('effect.json', gameVersion)

    if(!skillMap || !unitList || !effectList) return
    let units = unitList.filter(x=>+x.rarity === 7 && x.obtainable === true && +x.obtainableTime === 0)
    if(!units || errored || units?.length === 0) return
    let gameData = { lang: lang, abilityList: abilityList, skillMap: skillMap, effectList: effectList }
    for(let i in units){
      if(errored) continue
      let unit = { baseId: units[i].baseId, skill: [], ultimate: [] }
      let ultimate = await getSkill(units[i].limitBreakRef?.filter(x=>x.powerAdditiveTag === 'ultimate'), gameData)
      if(ultimate) unit.ultimate = ultimate
      let skill = await getSkill(unit[i].skillReference, data)
      if(skill?.length > 0) unit.skill = unit.skill.concat(skill)
      let crewSkill = await getCrewSkill(units[i].crew, data)
      if(crewSkill?.length > 0) unit.skill = unit.skill.concat(crewSkill)
      await mongo.set('skillList', {_id: unit.baseId}, unit)
    }
    lang = null, abilityList = null, abilityMap = null, skillList = null, unitList = null, effectList = null
    if(!errored) return true
  }catch(e){
    console.error(e)
  }
}
