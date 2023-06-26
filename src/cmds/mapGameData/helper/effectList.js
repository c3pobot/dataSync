'use strict'
const ReadFile = require('./readFile')
const effectMap = require('./map/effect')
let langArray, abilityList, effectList, lang, effects, units, missingEffects
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
const CleanEffectName = (string)=>{
  if(string){
    string = string.replace('\\n', '')
    string = string.replace(/\[c\]/g, ' ')
    string = string.replace(/\[\/c]/g, '')
    string = string.replace(/\[-\]/g, '')
    string = string.replace(/\[\w{1,6}\]/g, '')
    return string.trim()
  }
}
const AddTags = async(unit, skill, tags = [], data = {})=>{
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
            const tempEffect = JSON.parse(JSON.stringify(tags[i]))
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
        mongo.del('missingEffects', {_id: tags[i].tag})
      }else{
        if(data.missingEffects?.filter(x=>x.tag === tags[i].tag).length === 0){
          const tempTag = JSON.parse(JSON.stringify(tags[i]))
          tempTag.units = []
          missingEffects.push(tempTag)
        }
        let effectIndex = data.effects?.findIndex(x=>x.tag === tags[i].tag)
        if(effectIndex){
          if(data.effects[effectIndex].units.filter(x=>x.skillId === skill.id).length === 0)  data.effects[effectIndex].units.push(tempUnit)
        }
      }
    }
    if(!errored) return true
  }catch(e){
    setErrorFlag(e)
  }
}
const CheckUnit = async(unit, data = {})=>{
  try{
    if(!unit.skills) return
    for(let i in unit.skills){
      if(errored) continue
      const tempSkill = await CheckSkill(unit.skills[i], data)
      if(tempSkill){
        tempSkill.unitNameKey = unit.nameKey
        tempSkill.unitBaseId = unit.baseId
        mongo.set('mechanicList', {_id: unit.skills[i].id}, tempSkill)
        if(tempSkill?.tags?.length > 0){
          const status = await AddTags(unit, unit.skills[i], tempSkill.tags)
          if(!status) errored = true
        }
      }else{
        errored = true
      }
    }
    if(!errored) return true
  }catch(e){
    setErrorFlag(e)
  }
}
const CheckSkill = async(skill, data = {})=>{
  try{
    if(!skill) return
    const ability = data.abilityList?.find(x=>x.id === skill.abilityId);
    if(!ability) return
    const tempSkill = JSON.parse(JSON.stringify(skill))
    tempSkill.icon = ability.icon
    tempSkill.cooldownType = ability.cooldownType
    tempSkill.cooldown = ability.cooldown
    tempSkill.tiers = []
    tempSkill.tags = []
    const baseTier = await CheckEffects(ability.effectReference, 0, data)
    if(baseTier) tempSkill.tiers.push(baseTier)
    if(baseTier?.tags?.length > 0) await MergeTags(tempSkill.tags, baseTier.tags)

    if(ability?.tier?.length > 0){
      for(let i in ability.tier){
        if(errored) continue
        const tempTier = await CheckEffects(ability.tier[i].effectReference, (+i + 1), data)
        if(tempTier){
          tempTier.cooldownMaxOverride = ability.tier[i].cooldownMaxOverride
          tempSkill.tiers.push(tempTier)
          if(tempTier.tags?.length > 0) await MergeTags(tempSkill.tags, tempTier.tags)
        }
      }
    }
    if(!errored) return tempSkill
  }catch(e){
    setErrorFlag(e)
  }
}
const CheckEffects = async(effectReference = [], tier, data = {})=>{
  try{
    const res = {effects: [], tags: [], tier: tier}
    for(let i in effectReference){
      const tempObj = await CheckEffect(effectReference[i].id, data)
      if(!tempObj) continue
      res.effects.push(tempObj)
      if(tempObj.tags?.length > 0) res.tags = res.tags.concat(tempObj.tags)
    }
    if(!errored) return res
  }catch(e){
    setErrorFlag(e)
  }
}
const CheckEffect = async(id, data = {})=>{
  try{
    const effect = data.effectList.find(x=>x.id === id)
    if(!effect) return
    let res = JSON.parse(JSON.stringify(effect))
    res.effectReference = []
    res.tags = await CheckTags(effect, data)
    if(!res.tags) res.tags = []
    if(effect.effectReference?.length > 0){
      for(let i in effect.effectReference){
        const tempEffect = await CheckEffect(effect.effectReference[i].id, data)
        if(tempEffect){
          res.effectReference.push(tempEffect)
          if(tempEffect.tags.length > 0) res.tags = res.tags.concat(tempEffect.tags)
        }
      }
    }
    if(!errored) return res
  }catch(e){
    setErrorFlag(e)
  }
}
const CheckTags = async(effect, data)=>{
  try{
    const tags = []
    if(effect.descriptiveTag?.filter(x=>x.tag.startsWith('countable_')).length > 0){
      for(let i in effect.descriptiveTag){
        const tempTag = await CheckTag(effect.descriptiveTag[i].tag, effect, data)
        if(tempTag) tags.push(tempTag)
      }
    }
    if(!errored) return tags
  }catch(e){
    setErrorFlag(e)
  }
}
const CheckTag = async(tag, effect, data = {})=>{
  try{
    if(tag && !tag.includes('ability') && !tag.includes('countable') && !tag.includes('clearable') && !tag.includes('featcounter') && !tag.startsWith('ai_') && tag !== 'buff' && tag !== 'debuff'){
      const tempTag = {
        tag: tag
      }
      if(effect.persistentIcon) tempTag.persistentIcon = effect.persistentIcon
      if(effect.persistentLocKey){
        tempTag.persistentLocKey = effect.persistentLocKey
      }else{
        const tempLocKeyName = 'BattleEffect_'+tag.replace('_buff','up').replace('_debuff','down').replace('special_')
        const tempLocKey = data.langArray.find(x=>x.toLowerCase() === tempLocKeyName.toLowerCase())
        if(tempLocKey){
          tempTag.persistentLocKey = tempLocKey
        }
      }

      if(!tempTag.persistentLocKey){
        if(effectMap && effectMap[tag]) tempTag.persistentLocKey = effectMap[tag]
      }

      let effectName = CleanEffectName(data.lang[tempTag.persistentLocKey]), tempName
      if(effectName) tempName = effectName.split(":")
      if(tempName){
        if(tempName[0]) tempTag.nameKey = tempName[0].trim()
        if(tempName[1]) tempTag.descKey = tempName[1].trim()
      }
      if(!errored) return tempTag
    }
  }catch(e){
    setErrorFlag(e)
  }
}
const MergeTags = async(array = [], tags = [])=>{
  try{
    for(let i in tags){
      if(array.filter(x=>x.nameKey === tags[i].nameKey && x.tag === tags[i].tag).length === 0) array.push(tags[i])
    }
  }catch(e){
    setErrorFlag(e)
  }
}
const mapEffects = async(langKey, langIndex, effects = [])=>{
  try{
    if(!langKey) return
    let effectName = CleanEffectName(langKey), tempName, nameKey, descKey
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
      if(index >= 0) effects[indes].locKeys?.push(langIndex.trim())
    }
    return effects
  }catch(e){
    setErrorFlag(e)
  }
}
module.exports = async(gameVersion, localeVersion, assetVersion)=>{
  try{
    errored = false
    let lang = await ReadFile('Loc_ENG_US.txt.json', localeVersion)
    let langArray = Object.keys(lang)
    let effectList = await ReadFile('effect.json', gameVersion)
    let abilityList = await ReadFile('ability.json', gameVersion)
    let units = await mongo.find('units', {}, {portrait: 0, thumbnail: 0})
    let effects = await mongo.find('effectList', {}, {_id: 0, TTL:0})
    let missingEffects = []
    if(!effects) effects = []
    let effectAutoComplete = []
    if(!lang || !langArray || !effectList || !abilityList || !unit || !effects) return
    for(let i in lang){
      if(errored) continue
      if(lang[i] && i.startsWith('BattleEffect_')){
        let status = await mapEffects(lang[i], i, effects)
        if(status){
          effects = status
        }else{
          errored = true
        }
      }
    }

    let tempObj
    let gameData = {abilityList: abilityList, effectList: effectList, langArray: langArray, effects: effects, missingEffects: missingEffects}
    for(let i in units){
      if(errored) continue
      let status = await CheckUnit(units[i], gameData)
      if(!status) errored = true
    }
    if(!errored){
      effects = gameData.effects
      if(effects?.length > 0){
        for(let i in effects){
          await mongo.set('effectList', {_id: effects[i].id}, effects[i])
          if(effects[i].nameKey && effects[i].units?.length > 0 && effects[i].id && effectAutoComplete.filter(x=>x.name === effects[i].nameKey).length === 0) effectAutoComplete.push({name: effects[i].nameKey, value: effects[i].id})
        }
      }
      if(effectAutoComplete?.length > 0) await mongo.set('autoComplete', {_id: 'effect'}, {include: true, data: effectAutoComplete})
      if(missingEffects?.length > 0){
        for(let i in missingEffects){
          if(missingEffects[i].units?.length > 0) await mongo.set('missingEffects', {_id: missingEffects[i].tag}, missingEffects[i])
        }
      }
    }
    langArray = null, abilityList = null, effectList = null, lang = null, effects = null, units = null, missingEffects = null
    if(!errored) return true
  }catch(e){
    console.error(e)
  }
}
