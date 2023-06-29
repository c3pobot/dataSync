'use strict'
const { readFile } = require('./helper')
module.exports = async(gameVersion, localeVersion, assetVersion)=>{
  try{
    let artifactDefinitionList = await readFile('artifactDefinition.json', gameVersion)
    let lang = await readFile('Loc_ENG_US.txt.json', localeVersion)
    if(!artifactDefinitionList || !lang) return
    for(let i in artifactDefinitionList){
      artifactDefinitionList[i].nameKey = lang[artifactDefinitionList[i].nameKey] || artifactDefinitionList[i].nameKey
      let descKey = lang[artifactDefinitionList[i].descriptionKey] || artifactDefinitionList[i].descriptionKey
      artifactDefinitionList[i].descriptionKey = descKey?.replace(/\//g, '').replace(/\[c\]/g, '').replace(/\[FFFF33\]/g, '').replace(/\[ffff33\]/g, '').replace(/\[-\]/g, '').replace(/\[-\]/g, '').replace(/\\n/g, '<br>')
      await mongo.set('conquestDiscList', {_id: artifactDefinitionList[i].id}, artifactDefinitionList[i])
    }
    lang = null, artifactDefinitionList = null
    return true
  }catch(e){
    throw(e)
  }
}
