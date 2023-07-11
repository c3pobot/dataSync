'use strict'
const log = require('logger')
const mongo = require('mongoapiclient')
let unitList
const getUnit = (unit = [], unitRarity = 0, unitRelicTier = 0)=>{
  try{
    let i = unit.length, res = []
    while(i--){
      let baseId = unit[i].unitIdentifier?.split(':')[0]
      if(!baseId || !unitList[baseId]) continue;
      let unitDef = unitList[baseId]
      res.push({ baseId: baseId, unitIdentifier: baseId, nameKey: unitDef.nameKey, combatType: unitDef.combatType, rarity: unitRarity, unitRelicTier: unitRelicTier })
    }
    return res
  }catch(e){
    throw(e)
  }
}
const getSquad = (squad = [], pDef = {})=>{
  try{
    let i = squad.length, res = []
    while(i--){
      let units = getUnit(squad[i].unit, pDef.unitRarity, pDef.unitRelicTier)
      if(units?.length > 0) res = res.concat(units)
    }
    return res
  }catch(e){
    throw(e)
  }
}
const getPlatoon = (platoon = [], pDef = {})=>{
  try{
    let i = platoon.length, res = { totalPoints: 0, squads: []}
    while(i--){
      let squad = getSquad(platoon[i].squad, pDef)
      let points = pDef.platoonDefinition[platoon[i].id]?.score || 0
      res.totalPoints += +points
      res.squads.push({ id: platoon[i].id, units: squad, points: +points })
    }
    return res
  }catch(e){
    throw(e)
  }
}
const MapPlatoons = async(tbData = {})=>{
  try{
    let platoons = {}
    const tbDef = (await mongo.find('tbList', {_id: tbData.definitionId}, { nameKey: 1, reconZoneDefinition: 1, conflictZoneDefinition: 1, forceAlignment:1 }))[0]
    if(!tbDef?.reconZoneDefinition || !tbData?.reconZoneStatus) return
    let i = tbData.reconZoneStatus.length
    while(i--){
      let pDef = tbDef.reconZoneDefinition[tbData.reconZoneStatus[i].zoneStatus.zoneId]
      let zDef = tbDef.conflictZoneDefinition[pDef.linkedConflictId]
      if(!pDef || !zDef) continue;
      let id = zDef.phase+'-'+zDef.conflict
      if(!platoons[id]) platoons[id] = { id: id, nameKey: pDef.nameKey, phase: zDef.phase, conflict: zDef.conflict, type: zDef.type, sort: zDef.sort, totalPoints: 0, maxUnit: pDef.maxUnitCountPerPlayer, squads: [] }
      let squads = getPlatoon(tbData.reconZoneStatus[i].platoon, pDef)
      if(squads?.squads?.length > 0){
        platoons[id].totalPoints += squads.totalPoints
        platoons[id].squads = squads.squads
      }
    }
    await mongo.set('tbPlatoonList', {_id: tbData.definitionId}, {id: tbData.definitionId, nameKey: tbDef.nameKey, platoons: Object.values(platoons)})
  }catch(e){
    throw(e);
  }
}
module.exports = async()=>{
  try{
    let tempUnits = (await mongo.find('configMaps', {_id: 'unitMap'}))[0]?.data
    let tbNames = (await mongo.find('autoComplete', {_id: 'tb-name'}))[0]?.data
    if(tempUnits)
    if(tempUnits && tbNames){
      unitList = tempUnits
      let i = tbNames.length
      while(i--){
        let data = (await mongo.aggregate('tbCache', { definitionId: tbNames[i].value }, [{ $sort: {currentRoundEndTime: -1} }, { $limit: 10 }]))[0]
        if(data?.reconZoneStatus.filter(x=>x.platoon.length > 0).length > 0) await MapPlatoons(data)
      }
    }
    unitList = null
  }catch(e){
    throw(e)
  }
}
