'us strict'
const getDataVersions = require('./getDataVersions')
const dataUpdate = require('./dataUpdate')
const getGameVersions = require('../getGameVersions')

module.exports = async(versions = {}, forceFile = false)=>{
  try{
    if(!versions.gameVersion || !versions.localeVersion ||!version.assetVersion){
      versions = await getGameVersions()
    }
    if(!versions.gameVersion || !versions.localeVersion ||!version.assetVersion) return
    let gitVersions = await getDataVersions()
    if(!gitVersions?.gameVersion || !gitVersions?.localeVersion) return
    if(!forceFile && dataVersions.gameVersion === versions.gameVersion && dataVersions.localeVersion === versions.localeVersion && dataVersions.statCalcVersion === versions.gameVersion) return
    let { gameVersion, localeVersion, statCalcVersion } = await dataUpdate(versions.gameVersion, versions.localeVersion, forceFile)
    if(gameVersion) dataVersions.gameVersion = gameVersion
    if(localeVersion) dataVersions.localeVersion = localeVersion
    if(statCalcVersion) dataVersions.statCalcVersion = statCalcVersion
  }catch(e){
    console.error(e);
  }
}
