'use strict'
const { readFile, reportError } = require('./helper')
const staticMap = {UNITSTATMASTERY: {nameKey: 'UNIT_STAT_STAT_VIEW_MASTERY'}}
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
const getStatMap = (enums, lang, keyMap)=>{
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
    let keyMapping = await readFile('Loc_Key_Mapping.txt.json', localeVersion)
    let lang = await readFile('Loc_ENG_US.txt.json', localeVersion)
    let enums = await readFile('enums.json', gameVersion)
    if(!keyMapping || !lang || !enums) return
    
    let keyMap = await getKeyMap(keyMapping)
    let statMap = await getStatMap(enums['UnitStat'], lang, keyMap)
    if(statMap && !errored) await mongo.set('configMaps', {_id: 'statsMap'}, {data: statMap})
    keyMapping = null, lang = null, enums = null, keyMap = null, statMap = null
    if(!errored) return true
  }catch(e){
    reportError(e);
  }
}
