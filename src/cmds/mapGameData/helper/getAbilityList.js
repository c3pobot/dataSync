'use strict'
const ReadFile = require('./readFile')
module.exports = async(gameVersion, localeVersion, assetVersion)=>{
  try {
    let abilitList = await ReadFile('ability.json', gameVersion)
    if(!abilitList) return
    const list = {}
    abilitList.forEach(a=>{
      list[a.id] = {
        id: a.id,
        nameKey: a.nameKey,
        descKey: a.descKey,
        tier: a.tier.map(m=>{return Object.assign({}, {descKey: m.descKey, upgradeDescKey: m.upgradeDescKey})})
      }
    })
    abilitList = null
    return list
  } catch (e) {
    console.error(e)
  }
}
