'use strict'
const { readFile, getStatMap } = require('./helper')
module.exports = async(gameVersion, localeVersion, assetVersion)=>{
  try{
    let keyMapping = await readFile('Loc_Key_Mapping.txt.json', localeVersion)
    let lang = await readFile('Loc_ENG_US.txt.json', localeVersion)
    let enums = await readFile('enums.json', gameVersion)
    if(!keyMapping || !lang || !enums) return

    let statMap = await getStatMap(enums['UnitStat'], lang, keyMapping)
    if(statMap){
      await mongo.set('configMaps', {_id: 'statsMap'}, {data: statMap})
      return true
    }
  }catch(e){
    throw(e);
  }
}
