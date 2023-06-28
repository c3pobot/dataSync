'use strict'
const fs = require('fs')
const path = require('path')
const pct = require('./maps/pct')
const CheckImages = require('./checkImages')
const { readFile, reportError } = require('./helper')

const enumType = {
  2: 'alignment',
  3: 'faction',
  8: 'unit'
}
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
const MapAbility = async(ability = [], lang = {})=>{
  try{
    let res = {}
    await ability.forEach(a=>{
      if(a.nameKey.includes('DATACRON')){
        res[a.id] = {
          nameKey: lang[a.nameKey] || a.nameKey,
          descKey: lang[a.descKey] || a.descKey,
          iconKey: a.icon
        }
      }
    })
    if(!errored && Object.values(res)?.length > 0) return res
  }catch(e){
    setErrorFlag(e)
  }
}
const MapFaction = async(faction = [], lang = {})=>{
  try{
    let res = {}
    await faction.forEach(f=>{
      if(f?.descKey && f.descKey !== 'PLACEHOLDER' && lang[f.descKey]){
        res[f.id] = {
          id: f.id,
          nameKey: lang[f.descKey],
          visible: f.visible,
          units: []
        }
      }
    })
    if(!errored && Object.values(res)?.length > 0) return res
  }catch(e){
    setErrorFlag(e)
  }
}
const MapUnits = async(units = [], faction = {}, lang = {})=>{
  try{
    let res = {}
    await units.forEach(u=>{
      if( +u.rarity !== 7 ) return
      if( u.obtainable !== true ) return
      if( +u.obtainableTime !== 0 ) return
      if(u.baseId && u.nameKey && lang[u.nameKey]){
        res[u.baseId] = {
          baseId: u.baseId,
          nameKey: lang[u.nameKey],
          combatType: u.combatType
        }
        for(let f in u?.categoryId){
          if(faction[u.categoryId[f]]) faction[u.categoryId[f]]?.units.push(res[u.baseId])
        }
      }
    })
    if(!errored && Object.values(res)?.length > 0) return res
  }catch(e){
    setErrorFlag(e)
  }
}
const MapStatEnum = (enums = {}, lang = {})=>{
  try{
    let res = {}, tempLang = {}
    for(let i in lang){
      if(i?.startsWith('UnitStat_') || i?.startsWith('UNIT_STAT_')){
        let enums = i.split('_')?.join('')?.split('TU')[0]?.toUpperCase()?.replace('STATVIEW', '')?.replace('STATSVIEW', '')
        if(enums) tempLang[enums] = {langId: i, nameKey: lang[i]}
      }
    }
    for(let i in enums){
      res[enums[i]] = {id: i, statId: enums[i], pct: pct[enums[i]]}
      if(tempLang[i]){
        res[enums[i]] = {...res[i],...tempLang[i]}
      }else{
        let stat = i.replace('UNITSTATMAX', 'UNITSTAT')
        if(tempLang[stat]) res[enums[i]] = {...res[i],...tempLang[stat]}
      }
    }
    if(!errored && Object.value(res)?.length > 0) return res
  }catch(e){
    setErrorFlag(e)
  }
}

const getTarget = async(category, affix, data = {})=>{
  try{
    if(!category || !affix) return
    for(let i in category){
      if(!category[i].exlude && data.faction[category[i].categoryId]){
        data.cron.ability[affix.abilityId].target[affix.targetRule] = {
          id: affix.targetRule,
          nameKey: ability[affix.abilityId].nameKey?.replace(/\{0\}/g, data.faction[category[i].categoryId]?.nameKey),
          descKey: ability[affix.abilityId].descKey?.replace(/\{0\}/g, data.faction[category[i].categoryId]?.nameKey)
        }
        if(data.type === 'unit') data.cron.ability[affix.abilityId].target[affix.targetRule].unit = data.faction[category[i].categoryId]?.units[0]
      }
    }
    if(!errored) return true
  }catch(e){
    setErrorFlag(e)
  }
}
const getAffix = async(affix, data = {})=>{
  try{
    if(!affix) return
    if(data.images?.filter(x=>x === affix.scopeIcon).length === 0) data.images.push(affix.scopeIcon)
    if(affix.statType > 0 && data.stats[affix.statType]){
      data.cron?.stat[affix.statType] = {
        id: affix.statType,
        nameKey: data.stats[affix.statType]?.nameKey,
        pct: stats[affix.statType]?.pct,
        iconKey: affix.scopeIcon
      }
    }
    if(data.type && affix?.abilityId && affix.targetRule && data.ability[affix.abilityId]){
      if(!data.cron.ability[affix.abilityId]) data.cron.ability[affix.abilityId] = {id: affix.abilityId, iconKey: affix.scopeIcon, target: {}}
      let target = data.targetSet?.find(x=>x.id === affix.targetRule)
      if(!target) return
      if(target?.category?.category?.length > 0){
        let status = await getTarget(target.category.category, affix data)
        if(!status) errored = true
      }
    }
    if(!errored) return true
  }catch(e){
    setErrorFlag(e)
  }
}
const getAffixSet = (affixTemplateSetId, data = {})=>{
  try{
    let affixSet = data.affix?.find(x=>x.id === affixTemplateSetId)
    if(!affixSet || !affixSet?.affix) return
    for(let i in affixSet.affix){
      if(errored) return
      let status = await getAffix(affixSet.affix[i], data)
      if(!status) errored = true
    }
    if(!errored) return true
  }catch(e){
    setErrorFlag(e)
  }
}
const getCron = async(cronTier, data = {})=>{
  try{
    data.type = enumType[data.tierIndex]
    for(let i in cronTier.affixTemplateSetId){
      if(errored) return
      let tempCron = await getAffixSet(cronTier.affixTemplateSetId[i], data)
      if(!tempCron) errored = true
    }
    if(errored) return
    return data
  }catch(e){
    setErrorFlag(e)
  }
}

module.exports = async(gameVersion, localeVersion, assetVersion)=>{
  try{
    errored = false
    if(!assetVersion) return
    let crons = {}, images = []
    let lang = await readFile('Loc_ENG_US.txt.json', localeVersion)
    let abilityList = await readFile('ability.json', gameVersion)
    let affix = await readFile('datacronAffixTemplateSet.json', gameVersion)
    let enums = await readFile('enums.json', gameVersion)
    let factionList = await readFile('category.json', gameVersion)
    let set = await readFile('datacronSet.json', gameVersion)
    let targetSet = await readFile('battleTargetingRule.json', gameVersion)
    let template = await readFile('datacronTemplate.json', gameVersion)
    let unitList = await readFile('units.json', gameVersion)

    if(!lang || !abilityList || !affix || !enums || !factionList || !set || !targetSet || !template || !unitList) return
    let ability = await MapAbility(abilityList, lang)
    let faction = await MapFaction(factionList, lang)
    let stats = await MapStatEnum(enums['UnitStat'], lang)
    if(!faction || !ability || !stats) return
    let units = await MapUnits(unitList, faction, lang)
    if(!units) return
    const timeNow = Date.now()
    template.forEach(async(cron)=>{
      let cronSet = set.find(x=>x.id === cron.setId)
      if(cronSet?.expirationTimeMs && +timeNow >= +cronSet.expirationTimeMs) return;
      images.push(cronSet.icon)
      cron.stat = {}
      cron.ability = {}
      cron.setTier = cronSet.tier
      cron.setMaterial = cronSet.setMaterial
      cron.nameKey = lang[cronSet.displayName]
      cron.expirationTimeMs = +cronSet.expirationTimeMs
      cron.iconKey = cronSet.icon
      cron.detailPrefab = cronSet.detailPrefab
      let gameData = {affix: affix, ability: ability, faction: faction, stats: stats, targetSet: targetSet, units: units, images: [], cron: cron, tierIndex: i }
      for(let i in cron.tier){
        if(errored) continue
        gameData.tierIndex = i
        let status = await getCron(cron.tier[i], gameData)
        if(status) cron = status.cron
        if(!status) errored = true
      }
      if(!errored){
        await mongo.set('datacronList', {_id: crons.id}, cron)
        gameData.images?.forEach(i=>{
          images.push(i)
        })
      }
    })
    if(!errored && images?.length > 0) CheckImages(images, assetVersion, 'thumbnail')
    stats = null, faction = null, units = null, ability = null, crons = null, images = null
    abilityList = null, lang = null, unitList = null, factionList = null, targetSet = null, enums = null
    if(!errored) return true
  }catch(e){
    reportError(e);
  }
}
