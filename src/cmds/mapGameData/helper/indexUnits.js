'use strict'
const ReadFile = require('./readFile')
module.exports = async(gameVersion, localeVersion, assetVersion)=>{
  try {
    let units = await ReadFile('units.json', gameVersion)
    if(!units) return
    units = units.filter(u => {
        if( +u.rarity !== 7 ) return false
        if( u.obtainable !== true ) return false
        if( +u.obtainableTime !== 0 ) return false
        return true
    })
    let idList = units.reduce((ids,u) => {
        ids = ids.concat(u.skillReference.map(s => s.skillId))
        ids = ids.concat(u.crew.map(cu => cu.skillReference[0].skillId))
        return ids
    },[])
    units = null
    return idList
  } catch (e) {
    console.error(e)
  }

}
