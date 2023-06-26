'use strict'
const fs = require('fs')
const path = require('path')
const pct = require('./maps/pct')
const SaveImage = require('../saveImage')
const ReadFile = require('./readFile')

const PUBLIC_DIR = process.env.PUBLIC_DIR || '/app/public'
const enumType = {
  2: 'alignment',
  3: 'faction',
  8: 'unit'
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
    if(Object.values(res)?.length > 0) return res
  }catch(e){
    console.error(e);
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
    if(Object.values(res)?.length > 0) return res
  }catch(e){
    console.error(e);
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
    if(Object.values(res)?.length > 0) return res
  }catch(e){
    console.error(e);
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
    if(Object.value(res)?.length > 0) return res
  }catch(e){
    console.error(e);
  }
}
const GetFileNames = (dir)=>{
  return new Promise(resolve =>{
    try{
      fs.readdir(dir, (err, files)=>{
        if(err) console.error(err);
        resolve(files)
      })
    }catch(e){
      console.error(e);
      resolve()
    }
  })
}
const CheckImages = async(imgs = [], assetVersion)=>{
  try{
    const assests = await GetFileNames(path.join(PUBLIC_DIR, 'thumbnail'))
    let missingAssets = imgs?.filter(x=>!assests.includes(x+'.png'))
    if(missingAssets?.length > 0){
      missingAssets.forEach(img=>{
        if(img.startsWith('icon_stat_')) return;
        SaveImage(assetVersion, img, 'thumbnail')
      })
    }
  }catch(e){
    console.error(e);
  }
}
let errored = false
const setErrorFlag(err)=>{
  try{
    errored = true
  }catch(e){
    console.error(e);
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
    console.log('datacronList updating...')
    errored = false
    if(!assetVersion) return
    let crons = {}, images = []
    let lang = await ReadFile('Loc_ENG_US.txt.json', localeVersion)
    let abilityList = await ReadFile('ability.json', gameVersion)
    let affix = await ReadFile('datacronAffixTemplateSet.json', gameVersion)
    let enums = await ReadFile('enums.json', gameVersion)
    let factionList = await ReadFile('category.json', gameVersion)
    let set = await ReadFile('datacronSet.json', gameVersion)
    let targetSet = await ReadFile('battleTargetingRule.json', gameVersion)
    let template = await ReadFile('datacronTemplate.json', gameVersion)
    let unitList = await ReadFile('units.json', gameVersion)

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
      for(let i in cron.tier){
        if(errored) continue
        let status = await getCron(cron.tier[i], {affix: affix, ability: ability, faction: faction, stats: stats, targetSet: targetSet, units: units, images: [], cron: cron, tierIndex: i })
        if(status) cron = status.cron
        if(!status) errored = true
      }
      if(!errored){
        await mongo.set('datacronList', {_id: crons.id}, cron)
        data.images?.forEach(i=>{
          images.push(i)
        })
      }
    })
    if(!errored && images?.length > 0 && assetVersion){
      CheckImages(images, assetVersion)
    }
    stats = null, faction = null, units = null, ability = null, crons = null, images = null
    abilityList = null, lang = null, unitList = null, factionList = null, targetSet = null, enums = null
    if(errored){
      console.error('datacronList update error...')
    }else{
      console.log('datacronList updated...')
      return true
    }
  }catch(e){
    console.error('datacronList update error...')
    console.error(e);
  }
}
