'use strict'
const { readFile } = require('./helper')
const mongo = require('mongoapiclient')
const GetPhase = (zoneId)=>{
  try{
    if(zoneId.includes('phase01_')) return 'P1'
    if(zoneId.includes('phase02_')) return 'P2'
    if(zoneId.includes('phase03_')) return 'P3'
    if(zoneId.includes('phase04_')) return 'P4'
    if(zoneId.includes('phase05_')) return 'P5'
    if(zoneId.includes('phase06_')) return 'P6'
  }catch(e){
    throw(e)
  }
}
const GetConflict = (zoneId)=>{
  try{
    if(zoneId.includes('_conflict01')) return 'C1'
    if(zoneId.includes('_conflict02')) return 'C2'
    if(zoneId.includes('_conflict03')) return 'C3'
    if(zoneId.includes('_conflict04')) return 'C4'
    if(zoneId.includes('_conflict05')) return 'C5'
    if(zoneId.includes('_conflict06')) return 'C6'
  }catch(e){
    throw(e)
  }
}
const GetType = (combatType, alignment)=>{
  try{
    if(combatType === 1) return 'Char'
    if(combatType === 2) return 'Ship'
    if(alignment === 1) return 'Mixed'
    if(alignment === 2) return 'LS'
    if(alignment === 3) return 'DS'
  }catch(e){
    throw(e)
  }
}
const GetSort = (type, conflict)=>{
  try{
    if(type === 'DS') return 1
    if(type === 'Mixed') return 2
    if(type === 'LS') return 3
    return +(conflict?.replace('C', ''))
  }catch(e){
    throw(e)
  }
}
const getConflictZoneDefinition = (conflictZoneDefinition = [], lang = {})=>{
  try{
    if(conflictZoneDefinition.length === 0) return
    let res = {}, i = conflictZoneDefinition.length
    while(i--){
      let tempDef = { zoneId: conflictZoneDefinition[i].zoneDefinition.zoneId }
      let victoryPointRewards = getStarPoints(conflictZoneDefinition[i].victoryPointRewards)
      tempDef.victoryPointRewards = victoryPointRewards
      tempDef.totalStars = +victoryPointRewards?.length || 0
      tempDef.nameKey = lang[conflictZoneDefinition[i].zoneDefinition.nameKey] || conflictZoneDefinition[i].zoneDefinition.nameKey
      tempDef.phase = GetPhase(conflictZoneDefinition[i].zoneDefinition.zoneId)
      tempDef.conflict = GetConflict(conflictZoneDefinition[i].zoneDefinition.zoneId)
      tempDef.type = GetType(conflictZoneDefinition[i].territoryBattleZoneUnitType, conflictZoneDefinition[i].forceAlignment)
      tempDef.sort = GetSort(tempDef.type, tempDef.conflict)
      tempDef.unitType = conflictZoneDefinition[i].territoryBattleZoneUnitType
      res[tempDef.zoneId] = tempDef
    }
    return res
  }catch(e){
    throw(e)
  }
}
const getStarPoints = (victoryPointRewards = [])=>{
  try{
    let res = [], i = victoryPointRewards.length
    for(let i in victoryPointRewards){
      if(victoryPointRewards[i].reward.type === 2) res.push({score: victoryPointRewards[i].galacticScoreRequirement, star: +i + 1})
    }
    return res
  }catch(e){
    throw(e)
  }
}
const getStrikeZoneDefinition = (strikeZoneDefinition = [], lang = {}) =>{
  try{
    if(strikeZoneDefinition.length === 0) return
    let res = {}, i = strikeZoneDefinition.length
    while(i--){
      let tempDef = { zoneId: strikeZoneDefinition[i].zoneDefinition.zoneId }
      tempDef.combatType = strikeZoneDefinition[i].combatType
      tempDef.linkedConflictId = strikeZoneDefinition[i].zoneDefinition.linkedConflictId
      tempDef.nameKey = lang[strikeZoneDefinition[i].zoneDefinition.nameKey] || strikeZoneDefinition[i].zoneDefinition.nameKey
      res[tempDef.zoneId] = tempDef
    }
    return res
  }catch(e){
    throw(e)
  }
}
const getCovertZoneDefinition = (covertZoneDefinition = [], lang = {}) =>{
  try{
    if(covertZoneDefinition.length === 0) return
    let res = {}, i = covertZoneDefinition.length
    while(i--){
      let tempDef = { zoneId: covertZoneDefinition[i].zoneDefinition.zoneId }
      tempDef.victoryReward = covertZoneDefinition[i].victoryReward
      tempDef.combatType = covertZoneDefinition[i].combatType
      tempDef.linkedConflictId = covertZoneDefinition[i].zoneDefinition.linkedConflictId
      tempDef.nameKey = lang[covertZoneDefinition[i].zoneDefinition.nameKey] || covertZoneDefinition[i].zoneDefinition.nameKey
      res[tempDef.zoneId] = tempDef
    }
    return res
  }catch(e){
    throw(e)
  }
}
const getStatCategory = (statCategory = [], lang = {})=>{
  try{
    if(statCategory.length === 0) return
    let res = {}, i = statCategory.length
    while(i--){
      res[statCategory[i].id] = lang[statCategory[i].nameKey] || statCategory[i].id
    }
    return res
  }catch(e){
    throw(e)
  }
}
const getReconZoneDefinition = (reconZoneDefinition = [], lang = {})=>{
  try{
    if(reconZoneDefinition.length === 0) return
    let res = {}, i = reconZoneDefinition.length
    while(i--){
      let platoonDefinition = getPlatoonDefinition(reconZoneDefinition[i].platoonDefinition, lang)
      if(!platoonDefinition) return
      let tempDef = {zoneId: reconZoneDefinition[i].zoneDefinition.zoneId }
      tempDef.platoonDefinition = platoonDefinition
      tempDef.unitRelicTier = reconZoneDefinition[i].unitRelicTier
      tempDef.unitType = reconZoneDefinition[i].territoryBattleZoneUnitType
      tempDef.unitRarity = reconZoneDefinition[i].unitRarity
      tempDef.linkedConflictId = reconZoneDefinition[i].zoneDefinition.linkedConflictId
      tempDef.maxUnitCountPerPlayer = +reconZoneDefinition[i].zoneDefinition.maxUnitCountPerPlayer
      tempDef.nameKey = lang[reconZoneDefinition[i].zoneDefinition.nameKey] || reconZoneDefinition[i].zoneDefinition.nameKey
      res[tempDef.zoneId] = tempDef
    }
    return res
  }catch(e){
    throw(e)
  }
}
const getPlatoonDefinition = (platoonDefinition = [], lang = {})=>{
  try{
    if(platoonDefinition.length === 0) return
    let res = {}, i = platoonDefinition.length
    while(i--){
      let squad = getPlatoonsSquad(platoonDefinition[i].squad, lang)
      if(!squad) return
      res[platoonDefinition[i].id] = { id: platoonDefinition[i].id }
      res[platoonDefinition[i].id].nameKey = lang[platoonDefinition[i].nameKey] || platoonDefinition[i].nameKey
      res[platoonDefinition[i].id].squad = squad
      res[platoonDefinition[i].id].score = platoonDefinition[i].reward.value
    }
    return res
  }catch(e){
    throw(e)
  }
}
const getPlatoonsSquad = (squad = [], lang = {})=>{
  try{
    if(squad.length === 0) return
    let res = {}, i = squad.length
    while(i--){
      res[squad[i].id] = lang[squad[i].nameKey] || squad[i].nameKey
    }
    return res
  }catch(e){
    throw(e)
  }
}
module.exports = async(gameVersion, localeVersion, assetVersion)=>{
  try{
    let lang = await readFile('Loc_ENG_US.txt.json', localeVersion)
    let tbList = await readFile('territoryBattleDefinition.json', gameVersion)
    if(!lang || !tbList) return
    let autocomplete = []
    for(let i in tbList){
      let tb = tbList[i]

      let conflictZoneDefinition = getConflictZoneDefinition(tb.conflictZoneDefinition, lang)
      if(!conflictZoneDefinition) continue
      let strikeZoneDefinition = getStrikeZoneDefinition(tb.strikeZoneDefinition, lang)
      if(!strikeZoneDefinition) continue
      let covertZoneDefinition = getCovertZoneDefinition(tb.covertZoneDefinition, lang)
      if(!covertZoneDefinition) continue
      let statCategory = getStatCategory(tb.statCategory, lang)
      if(!statCategory) continue
      let reconZoneDefinition = getReconZoneDefinition(tb.reconZoneDefinition, lang)
      if(!reconZoneDefinition) continue
      autocomplete.push({name: tb.nameKey, value: tb.id})
      let tempObj = { id: tb.id, nameKey: lang[tb.nameKey] || tb.nameKey, roundCount: tb.roundCount}
      tempObj.conflictZoneDefinition = conflictZoneDefinition
      tempObj.strikeZoneDefinition = strikeZoneDefinition
      tempObj.covertZoneDefinition = covertZoneDefinition
      tempObj.statCategory = statCategory
      tempObj.reconZoneDefinition = reconZoneDefinition
      await mongo.set('tbList', {_id: tb.id}, tempObj)
    }
    if(autocomplete?.length > 0){
      await mongo.rep('autoComplete', {_id: 'tb-name'}, {data: autocomplete, include: true})
      //await mongo.set('autoComplete', {_id: 'nameKeys'}, {include: false, 'data.tb-name': 'tb-name'} )
    }
    lang = null, tbList = null
    if(autocomplete?.length > 0) return true
  }catch(e){
    throw(e)
  }
}
