'use strict'
const ReadFile = require('./readFile')
module.exports = async(errObj)=>{
  try{
    console.log('Updating conquest discs ...')
    const discDef = await ReadFile(baseDir+'/data/files/artifactDefinition.json')
    let lang = await ReadFile(baseDir+'/data/files/ENG_US.json')
    if(discDef && discDef.length > 0){
      for(let i in discDef){
        if(lang[discDef[i].nameKey]) discDef[i].nameKey = lang[discDef[i].nameKey]
        if(lang[discDef[i].descriptionKey]) discDef[i].descriptionKey = lang[discDef[i].descriptionKey].replace(/\//g, '').replace(/\[c\]/g, '').replace(/\[FFFF33\]/g, '').replace(/\[ffff33\]/g, '').replace(/\[-\]/g, '').replace(/\[-\]/g, '').replace(/\\n/g, '<br>')
        mongo.set('dataDisc', {_id: discDef[i].id}, discDef[i])
      }
      errObj.complete++
    }else{
      errObj.error++
    }
    lang = null
  }catch(e){
    console.log(e)
    errObj.error++
  }
}
