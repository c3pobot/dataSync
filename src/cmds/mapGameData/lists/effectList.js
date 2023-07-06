'use strict'
const { readFile, getSkillMap } = require('./helper')
const effectMap = require('./maps/effect')
const mongo = require('mongoapiclient')
let errored = false
const cleanEffectName = (string)=>{
  if(string){
    string = string.replace('\\n', '')
    string = string.replace(/\[c\]/g, ' ')
    string = string.replace(/\[\/c]/g, '')
    string = string.replace(/\[-\]/g, '')
    string = string.replace(/\[\w{1,6}\]/g, '')
    return string.trim()
  }
}
const addTags = async(unit, skill, tags = [], data = {})=>{
  try{
    const tempUnit = {
      nameKey: unit.nameKey,
      baseId: unit.baseId,
      combatType: unit.combatType,
      skillId: skill.id,
      skill: JSON.parse(JSON.stringify(skill))
    }
    for(let i in tags){
      if(tags[i].nameKey){
        if(skill.descKey.toLowerCase().includes(tags[i].nameKey.toLowerCase())){
          if(data.effects?.filter(x=>x.nameKey === tags[i].nameKey).length === 0 && tags[i].persistentLocKey){
            let tempEffect = JSON.parse(JSON.stringify(tags[i]))
            tempEffect.id = tempEffect.persistentLocKey
            tempEffect.tags = []
            tempEffect.units = []
            data.effects.push(tempEffect)
          }
          let effectIndex = data.effects?.findIndex(x=>x.nameKey === tags[i].nameKey)
          if(effectIndex >= 0){
            if(data.effects[effectIndex].tags.filter(x=>x === tags[i].tag).length === 0) data.effects[effectIndex].tags.push(tags[i].tag)
            if(data.effects[effectIndex].units.filter(x=>x.skillId === skill.id).length === 0 )  data.effects[effectIndex].units.push(tempUnit)
          }
        }
        mongo.del('missingEffectList', {_id: tags[i].tag})
      }else{
        if(data.missingEffects?.filter(x=>x.tag === tags[i].tag).length === 0){
          let tempTag = JSON.parse(JSON.stringify(tags[i]))
          tempTag.units = []
          data.missingEffects.push(tempTag)
        }
        let effectIndex = data.missingEffects?.findIndex(x=>x.tag === tags[i].tag)
        if(effectIndex){
          if(data.missingEffects[effectIndex].units.filter(x=>x.skillId === skill.id).length === 0)  data.missingEffects[effectIndex].units.push(tempUnit)
        }
      }
    }
    if(!errored) return true
  }catch(e){
    throw(e)
  }
}
const checkUnit = async(unit, data = {})=>{
  try{
    if(!unit || !unit.skill) throw('units missing in checkUnits')
    for(let i in unit.skill){
      if(errored) continue
      let tags = await checkSkill(unit.skill[i], data)
      if(tags?.length > 0){
        let status = await addTags(unit, unit.skill[i], tags, data)
        if(!status) throw('error with AddTags in checkUnits for '+unit.baseId)
      }
    }
    if(!errored) return true
  }catch(e){
    throw(e)
  }
}
const checkSkill = async(skill, data = {})=>{
  try{
    if(!skill) return
    let ability = data.abilityList?.find(x=>x.id === skill.abilityId);
    if(!ability) throw('ability not found in checkSkill for'+skill.abilityId)
    let tags = await checkEffects(ability.effectReference, data)
    if(!tags) tags = []
    for(let i in ability.tier){
      if(errored) continue
      let tierTags = await checkEffects(ability.tier[i].effectReference, data)
      if(tierTags?.length > 0){
        let mergedTags = await mergeTags(tags, tierTags)
        if(mergedTags?.length > 0) tags = JSON.parse(JSON.stringify(mergedTags))
      }
    }
    if(!errored && tags.length > 0) return tags
  }catch(e){
    throw(e)
  }
}
const checkEffects = async(effectReference = [], data = {})=>{
  try{
    let res = []
    for(let i in effectReference){
      let tempObj = await checkEffect(effectReference[i].id, data)
      if(!tempObj) continue
      if(tempObj?.length > 0) res = res.concat(tempObj)
    }
    if(!errored && res.length > 0) return res
  }catch(e){
    throw(e)
  }
}
const checkEffect = async(id, data = {})=>{
  try{
    const effect = data.effectList.find(x=>x.id === id)
    if(!effect) return
    let res = await checkTags(effect, data)
    if(!res) res = []
    if(effect.effectReference?.length > 0){
      for(let i in effect.effectReference){
        let tempEffect = await checkEffect(effect.effectReference[i].id, data)
        if(tempEffect?.length > 0) res = res.concat(tempEffect)
      }
    }
    if(!errored) return res
  }catch(e){
    throw(e)
  }
}
const checkTags = async(effect, data)=>{
  try{
    let tags = []
    if(effect.descriptiveTag?.filter(x=>x.tag.startsWith('countable_')).length > 0){
      for(let i in effect.descriptiveTag){
        let tempTag = await checkTag(effect.descriptiveTag[i].tag, effect, data)
        if(tempTag) tags.push(tempTag)
      }
    }
    if(!errored) return tags
  }catch(e){
    throw(e)
  }
}
const checkTag = async(tag, effect, data = {})=>{
  try{
    if(tag && !tag.includes('ability') && !tag.includes('countable') && !tag.includes('clearable') && !tag.includes('featcounter') && !tag.startsWith('ai_') && tag !== 'buff' && tag !== 'debuff'){
      let tempTag = {
        tag: tag
      }
      if(effect.persistentIcon) tempTag.persistentIcon = effect.persistentIcon
      if(effect.persistentLocKey){
        tempTag.persistentLocKey = effect.persistentLocKey
      }else{
        let tempLocKeyName = 'BattleEffect_'+tag.replace('_buff','up').replace('_debuff','down').replace('special_')
        let tempLocKey = data.langArray.find(x=>x.toLowerCase() === tempLocKeyName.toLowerCase())
        if(tempLocKey) tempTag.persistentLocKey = tempLocKey
      }
      if(!tempTag.persistentLocKey){
        if(effectMap && effectMap[tag]) tempTag.persistentLocKey = effectMap[tag]
      }
      let effectName = cleanEffectName(data.lang[tempTag.persistentLocKey]), tempName
      if(effectName) tempName = effectName.split(":")
      if(tempName){
        if(tempName[0]) tempTag.nameKey = tempName[0].trim()
        if(tempName[1]) tempTag.descKey = tempName[1].trim()
      }
      if(!errored) return tempTag
    }
  }catch(e){
    throw(e)
  }
}
const mergeTags = async(array = [], tags = [])=>{
  try{
    for(let i in tags){
      if(array.filter(x=>x.nameKey === tags[i].nameKey && x.tag === tags[i].tag).length === 0) array.push(tags[i])
    }
  }catch(e){
    throw(e)
  }
}
const mapEffects = async(langKey, langIndex, effects = [])=>{
  try{
    if(!langKey) return
    let effectName = cleanEffectName(langKey), tempName, nameKey, descKey
    if(effectName) tempName = effectName.split(":")
    if(tempName){
      if(tempName[0]) nameKey = tempName[0].trim()
      if(tempName[1]) descKey = tempName[1].trim()
    }
    if(!nameKey) return effects
    if(effects.filter(x=>x.nameKey === nameKey).length === 0){
      const tempObj = {
        id: langIndex.trim(),
        nameKey: nameKey,
        descKey: descKey,
        locKeys: [],
        tags: [],
        units: []
      }
      tempObj.locKeys.push(langIndex.trim())
      effects.push(tempObj)
    }else{
      const index = effects.findIndex(x=>x.nameKey === nameKey)
      if(index >= 0) effects[index].locKeys?.push(langIndex.trim())
    }
    return effects
  }catch(e){
    throw(e)
  }
}
const getSkill = (skillReference, skillMap)=>{
  try{
    if(!skillReference || !skillMap) throw('missing data for getSkill')
    let res = {}
    for(let i in skillReference){
      if(skillMap[skillReference[i].skillId]) res[skillReference[i].skillId] = skillMap[skillReference[i].skillId]
    }
    if(Object.values(res)?.length > 0) return res
  }catch(e){
    throw(e)
  }
}
const getUnitMap = async(unitList = [], skillMap, lang)=>{
  try{
    if(unitList.length === 0 || !skillMap || !lang) return
    let res = {}
    for(let i in unitList){
      res[unitList[i].baseId] = {
        nameKey: lang[unitList[i].nameKey] || unitList[i].nameKey,
        baseId: unitList[i].baseId,
        skill: {}
      }
      let skill = await getSkill(unitList[i].skillReference, skillMap)
      if(skill) res[unitList[i].baseId].skill = skill
    }
    if(Object.values(res)?.length > 0) return res
  }catch(e){
    throw(e)
  }
}
module.exports = async(gameVersion, localeVersion, assetVersion)=>{
  try{
    errored = false
    let lang = await readFile('Loc_ENG_US.txt.json', localeVersion)
    let langArray = Object.keys(lang)
    let effectList = await readFile('effect.json', gameVersion)
    let abilityList = await readFile('ability.json', gameVersion)
    let skillList = await readFile('skill.json', gameVersion)
    let skillMap = await getSkillMap(skillList, abilityList, lang)
    let unitList = await readFile('units.json', gameVersion)
    if(unitList) unitList = unitList.filter(x=>+x.rarity === 7 && x.obtainable === true && +x.obtainableTime === 0)
    let unitMap = await getUnitMap(unitList, skillMap, lang)
    let effects = await mongo.find('effectList', {}, {_id: 0, TTL:0})
    let missingEffects = []
    if(!effects) effects = []
    let effectAutoComplete = []
    if(!lang || !langArray || !effectList || !abilityList || !unitMap || !effects) return
    let gameData = {abilityList: abilityList, effectList: effectList, lang: lang, langArray: langArray, effects: effects, missingEffects: missingEffects, skillMap: skillMap}
    for(let i in lang){
      if(errored) continue
      if(lang[i] && i.startsWith('BattleEffect_')){
        let status = await mapEffects(lang[i], i, effects)
        if(status){
          gameData.effects = status
        }else{
          errored = true
        }
      }
    }
    for(let i in unitMap){
      if(errored) continue
      let status = await checkUnit(unitMap[i], gameData)
      if(!status) errored = true
    }
    if(!errored){
      effects = gameData.effects
      missingEffects = gameData.missingEffects
      if(effects?.length > 0){
        for(let i in effects){
          await mongo.set('effectList', {_id: effects[i].id}, effects[i])
          if(effects[i].nameKey && effects[i].units?.length > 0 && effects[i].id && effectAutoComplete.filter(x=>x.name === effects[i].nameKey).length === 0) effectAutoComplete.push({name: effects[i].nameKey, value: effects[i].id})
        }
      }
      if(effectAutoComplete?.length > 0){
        await mongo.set('autoComplete', {_id: 'effect'}, {include: true, data: effectAutoComplete})
        await mongo.set('autoComplete', {_id: 'nameKeys'}, {include: false, 'data.effect': 'effect'} )
      }
      if(missingEffects?.length > 0){
        for(let i in missingEffects){
          if(missingEffects[i].units?.length > 0) mongo.set('missingEffects', {_id: missingEffects[i].tag}, missingEffects[i])
        }
      }
    }
    lang = null, langArray = null, effectList = null, abilityList = null, skillList = null, skillMap = null, unitList = null, unitMap = null, effects = null
    if(!errored) return true
  }catch(e){
    throw(e)
  }
}
