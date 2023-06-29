'use strict'
const CheckImages = require('./checkImages')
const altName = {'species_wookiee_ls': 'Light Side Wookiee'}
const { readFile, getStatMap } = require('./helper')

const enumType = {
  2: 'alignment',
  3: 'faction',
  8: 'unit'
}
let errored = false

const getAbilityMap = async(abilityList = [], lang = {})=>{
  try{
    let res = {}
    for(let i in abilityList){
      res[abilityList[i].id] = {
        id: abilityList[i].id,
        defaultNameKey: abilityList[i].nameKey,
        nameKey: lang[abilityList[i].nameKey] || abilityList[i].nameKey,
        descKey: lang[abilityList[i].descKey] || abilityList[i].descKey,
        iconKey: abilityList[i].icon
      }
    }
    if(!errored && Object.values(res)?.length > 0) return res
  }catch(e){
    throw(e)
  }
}
const getFactionMap = async(categoryList = [], lang = {})=>{
  try{
    let res = {}
    for(let i in categoryList){
      if(!categoryList[i]?.descKey || categoryList[i]?.descKey === 'PLACEHOLDER' || !lang[categoryList[i].descKey]) continue
      res[categoryList[i].id] = {
        id: categoryList[i].id,
        nameKey: altName[categoryList[i].id] || lang[categoryList[i].descKey],
        visible: categoryList[i].visible,
        units: []
      }
    }
    if(!errored && Object.values(res)?.length > 0) return res
  }catch(e){
    throw(e)
  }
}
const getUnitMap = async(unitList = [], faction = {}, lang = {})=>{
  try{
    let res = {}
    for(let i in unitList){
      if(!lang[unitList[i].nameKey]) continue
      let tempUnit = {
        baseId: unitList[i].baseId,
        nameKey: lang[unitList[i].nameKey],
        combatType: unitList[i].combatType
      }
      for(let f in unitList[i].categoryId){
        if(faction[unitList[i].categoryId[f]]) faction[unitList[i].categoryId[f]]?.units.push(tempUnit)
      }
      res[unitList[i].baseId] = tempUnit

    }
    if(!errored && Object.values(res)?.length > 0) return res
  }catch(e){
    throw(e)
  }
}

const getCategory = async(category, cron, cronType, affix, data)=>{
  try{
    if(!category) return
    if(!category.exlude && data.faction[category.categoryId]){
      cron.ability[affix.abilityId].target[affix.targetRule] = {
        id: affix.targetRule,
        nameKey: data.ability[affix.abilityId].nameKey?.replace(/\{0\}/g, data.faction[category.categoryId].nameKey),
        descKey: data.ability[affix.abilityId].descKey?.replace(/\{0\}/g, data.faction[category.categoryId].nameKey)
      }
      if(cronType === 'unit') cron.ability[affix.abilityId].target[affix.targetRule].unit = data.faction[category.categoryId].units[0]
    }
    return true
  }catch(e){
    throw(e)
  }
}
const getAffix = async(affix, cron, cronType, data = {})=>{
  try{
    if(!affix) return
    if(data.images.filter(x=>x === affix.scopeIcon).length === 0) data.images.push(affix.scopeIcon)
    if(affix.statType > 0 && data.stats[affix.statType] && +affix.statValueMin > 0){
      cron.stat[affix.statType] = {
        id: affix.statType,
        nameKey: data.stats[affix.statType].nameKey,
        pct: data.stats[affix.statType].pct,
        iconKey: affix.scopeIcon
      }
    }
    if(cronType && affix.abilityId && affix.abilityId !== '' && affix.targetRule && data.ability[affix.abilityId]){
      let target = data.targetSet.find(x=>x.id === affix.targetRule)
      if(!cron.ability[affix.abilityId]) cron.ability[affix.abilityId] = {id: affix.abilityId, iconKey: affix.scopeIcon, target: {}}
      for(let i in target.category.category){
        let status = await getCategory(target.category.category[i], cron, cronType, affix, data)
        if(!status) throw('error with getCategory in getAffix')
      }
    }
    if(!errored) return true
  }catch(e){
    throw(e)
  }
}
const getaffixTemplateSet = async(affixTemplateSetId, cron, cronType, data = {})=>{
  try{
    if(!affixTemplateSetId) return
    let affixSet = data.affix.find(x=>x.id === affixTemplateSetId)
    if(!affixSet) return
    for(let i in affixSet.affix){
      let status = await getAffix(affixSet.affix[i], cron, cronType, data)
      if(!status) throw('error with getAffix in getaffixTemplateSet')
    }
    if(!errored) return true
  }catch(e){
    throw(e)
  }
}
const getCronTier = async(tier, cron, cronType, data = {})=>{
  try{
    if(!tier) return
    for(let i in tier.affixTemplateSetId){
      if(errored) continue;
      let status = await getaffixTemplateSet(tier.affixTemplateSetId[i], cron, cronType, data)
      if(!status) throw('error with getaffixTemplateSet in getCronTier')
    }
    if(!errored) return true
  }catch(e){
    throw(e)
  }
}

module.exports = async(gameVersion, localeVersion, assetVersion)=>{
  try{
    errored = false
    if(!assetVersion) return

    let lang = await readFile('Loc_ENG_US.txt.json', localeVersion)
    let keyMapping = await readFile('Loc_Key_Mapping.txt.json', localeVersion)
    let abilityList = await readFile('ability.json', gameVersion)
    let datacronAffixTemplateSet = await readFile('datacronAffixTemplateSet.json', gameVersion)
    let enums = await readFile('enums.json', gameVersion)
    let categoryList = await readFile('category.json', gameVersion)
    let datacronSetList = await readFile('datacronSet.json', gameVersion)
    let battleTargetingRuleList = await readFile('battleTargetingRule.json', gameVersion)
    let datacronTemplate = await readFile('datacronTemplate.json', gameVersion)
    let unitList = await readFile('units.json', gameVersion)
    if(unitList) unitList = unitList.filter(x=>+x.rarity === 7 && x.obtainable === true && +x.obtainableTime === 0)
    if(!lang || !abilityList || !datacronAffixTemplateSet || !enums || !categoryList || !datacronSetList || !battleTargetingRuleList || !datacronTemplate || !unitList) return
    let ability = await getAbilityMap(abilityList, lang)
    let faction = await getFactionMap(categoryList, lang)
    let stats = await getStatMap(enums['UnitStat'], lang, keyMapping)
    if(!faction || !ability || !stats) return
    let units = await getUnitMap(unitList, faction, lang)
    if(!units) return

    const timeNow = Date.now()
    let gameData = {affix: datacronAffixTemplateSet, ability: ability, faction: faction, stats: stats, targetSet: battleTargetingRuleList, units: units, images: []}
    for(let i in datacronTemplate){
      let cron = datacronTemplate[i]
      let cronSet = datacronSetList.find(x=>x.id === cron.setId)
      if(cronSet?.expirationTimeMs && +timeNow >= +cronSet.expirationTimeMs) continue;
      gameData.images.push(cronSet.icon)
      cron.stat = {}
      cron.ability = {}
      cron.setTier = cronSet.tier
      cron.setMaterial = cronSet.setMaterial
      cron.nameKey = lang[cronSet.displayName]
      cron.expirationTimeMs = +cronSet.expirationTimeMs
      cron.iconKey = cronSet.icon
      cron.detailPrefab = cronSet.detailPrefab

      for(let i in cron.tier){
        if(errored) continue;
        let status = await getCronTier(cron.tier[i], cron, enumType[i], gameData)
        if(!status) errored = true
      }
      if(!errored) await mongo.set('datacronList', {_id: cron.id}, cron)
    }
    if(!errored && gameData.images?.length > 0) CheckImages(gameData.images, assetVersion, 'thumbnail', 'datacronList')
    lang = null, abilityList = null, datacronAffixTemplateSet = null, enums = null, categoryList = null, datacronSetList = null
    battleTargetingRuleList = null, datacronTemplate = null, unitList = null
    if(!errored) return true
  }catch(e){
    throw(e);
  }
}
