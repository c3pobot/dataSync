'use strict'
module.exports = async(gameVersion, localeVersion)=>{
  try{
    let statMap = (await mongo.find('configMaps', {_id: 'statMap'}))[0]
    if(statMap?.version === gameVersion) return statMap.data
  }catch(e){
    throw(e)
  }
}
