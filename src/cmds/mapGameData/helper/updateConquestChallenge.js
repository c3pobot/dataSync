'use strict'
const ReadFile = require('./readFile')
module.exports = async(gameVersion, localeVersion)=>{
  try{
    console.log('Updating Conquest Feats ...')
    let cqDef = await ReadFile('challenge.json', gameVersion)
    let lang = await ReadFile('ENG_US.json', localeVersion)
    if(!cqDef || !lang) return
    cqDef = cqDef.filter(x=>x.reward.filter(x=>x.type === 22).length > 0)
    cqDef.forEach(async(c)=>{
      const tempObj = {
        id: c.id,
        nameKey: (lang[c.nameKey] ? lang[c.nameKey]:c.nameKey),
        descKey: (lang[c.descKey] ? lang[c.descKey]:c.descKey),
        reward: +(c.reward.find(x=>x.type == 22) ? c.reward.find(x=>x.type == 22).minQuantity:0),
        type: c.type,
        difficulty: (c.id.includes('_III_DIFF') ? 10:(c.id.includes('_II_DIFF') ? 9:8))
      }
      await mongo.set('cqFeats', {_id: c.id}, tempObj)
    })
    lang = null
    cqDef = null
    return true
  }catch(e){
    console.error('error updating conquest feats...')
    console.error(e)
  }
}
