'use strict'
const ReadFile = require('./readFile')
const getAbilityList = require('./getAbilityList')
const enumOmicron = require('./maps/omicrons')
module.exports = async(gameVersion, localeVersion, assetVersion)=>{
  try {
    let abilityList = await getAbilityList(gameVersion, localeVersion, assetVersion)
    let skillList = await ReadFile('skill.json', gameVersion)
    let lang = await ReadFile('Loc_ENG_US.txt.json', localeVersion)
    if(!abilitList || !skillList || !lang) return
    const list = {}
    skillList.forEach(s=>{
      if(!lang[abilityList[s.abilityReference].nameKey]) return;
      let descKey = abilityList[s.abilityReference].descKey
      if(abilityList[s.abilityReference]?.tier?.length > 0 && abilityList[s.abilityReference].tier[s.tier.length - 1]) descKey = abilityList[s.abilityReference].tier[s.tier.length - 1].descKey;
      list[s.id] = {
        id: s.id,
        abilityId: abilityList[s.abilityReference].id,
        maxTier: +(s.tier.length) + 1,
        nameKey: lang[abilityList[s.abilityReference].nameKey],
        descKey: lang[descKey] || descKey,
        omicronMode: s.omicronMode,
        omicronType: (enumOmicron[s.omicronMode] ? enumOmicron[s.omicronMode].nameKey:''),
        type: (enumOmicron[s.omicronMode] ? enumOmicron[s.omicronMode].type:'')
      }
      for(let i in s.tier){
        if(!(list[s.id].zetaTier >= 0) && s.tier[i].isZetaTier){
          list[s.id].isZeta = true
          list[s.id].zetaTier = +i + 2;
        }
        if(s.tier[i].isOmicronTier){
          list[s.id].isOmi = true
          list[s.id].omiTier = +i + 2;
        }
      }
    })
    abilityList = null, skillList = null, lang = null
    return list
  } catch (e) {
    console.error(e)
  }

}
