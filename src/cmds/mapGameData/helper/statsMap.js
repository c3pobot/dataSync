'use strict'
const ReadFile = require('./readFile')
const staticMap = {UNITSTATMASTERY: {nameKey: 'UNIT_STAT_STAT_VIEW_MASTERY'}}
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
const getStatsMap = (enums, lang, keyMap)=>{
  try{
    if(!enums || !lang || !keyMap) return
    let res = {}
    for(let i in enums){
      let key = keyMap.find(x=>x.enum.startsWith(i))
      if(!key) key = keyMap.find(x=>x.enum.startsWith(i.replace('UNITSTATMAX', 'UNITSTAT')))
      if(!key) key = staticMap[i]
      res[enums[i]] = { statId: enums[i], enum: i, nameKey: lang[key?.nameKey] || key?.nameKey }
    }
    if(!errored) return res
  }catch(e){
    setErrorFlag(e);
  }
}
const getKeyMap = (keyMapping = {})=>{
  try{
    let res = []
    for(let i in keyMapping){
      if(i?.startsWith('UnitStat_')){
        let statKey = keyMapping[i].replace('__', '')
        res.push({nameKey: keyMapping[i].replace('__', ''), enum: statKey.replace('UnitStat_', 'UNITSTAT').toUpperCase()})
      }
    }
    if(!errored) return res
  }catch(e){
    setErrorFlag(e);
  }
}
module.exports = async(gameVersion, localeVersion, assetVersion)=>{
  try{
    errored = false
    let keyMapping = await ReadFile('Loc_Key_Mapping.txt.json', localeVersion)
    let lang = await ReadFile('Loc_ENG_US.txt.json', localeVersion)
    let enums = await ReadFile('enums.json', gameVersion)
    if(!keyMapping || !lang || !enums) return
    let keyMap = await getKeyMap(keyMapping)
    let statsMap = await getStatsMap(enums['UnitStat'], lang, keyMap)
    if(statsMap && !errored){
      await mongo.set('configMaps', {_id: 'statsMap'}, {data: statsMap})
      return true
    }
  }catch(e){
    console.error(e);
  }
}
