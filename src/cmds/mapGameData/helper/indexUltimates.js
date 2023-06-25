'use strict'
const ReadFile = require('./readFile')
module.exports = async(gameVersion, localeVersion)=>{
  try{
    let units = await ReadFile('units.json', gameVersion)
    if(!units) return
    units = units.filter(u => {
        if( +u.rarity !== 7 ) return false
        if( u.obtainable !== true ) return false
        if( +u.obtainableTime !== 0 ) return false
        return true
    })
    let idList = units.reduce((ids,u) => {
        ids = ids.concat(u.limitBreakRef.filter(x=>x.abilityId.startsWith('ultimate')).map(s => s.abilityId))
        ids = ids.concat(u.uniqueAbilityRef.filter(x=>x.abilityId.startsWith('ultimate')).map(s => s.abilityId))
        return ids
    },[])
    units = null
    return idList
  }catch(e){
    console.error(e)
  }
}
