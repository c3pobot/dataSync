'use strict'
const { readFile, reportError } = require('./helper')

module.exports = async(gameVersion, localeVersion, assetVersion)=>{
  try{
    let discDef = await readFile('artifactDefinition.json', gameVersion)
    let lang = await readFile('Loc_ENG_US.txt.json', localeVersion)
    if(!discDef || !lang) return
    for(let i in discDef){
      discDef[i].nameKey = lang[discDef[i].nameKey] || discDef[i].nameKey
      if(lang[discDef[i].descriptionKey]) discDef[i].descriptionKey = lang[discDef[i].descriptionKey].replace(/\//g, '').replace(/\[c\]/g, '').replace(/\[FFFF33\]/g, '').replace(/\[ffff33\]/g, '').replace(/\[-\]/g, '').replace(/\[-\]/g, '').replace(/\\n/g, '<br>')
      await mongo.set('conquestDiscList', {_id: discDef[i].id}, discDef[i])
    }
    lang = null, discDef = null
    return true
  }catch(e){
    reportError(e)
  }
}
