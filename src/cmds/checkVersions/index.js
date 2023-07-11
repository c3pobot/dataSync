'us strict'
const getDataVersions = require('./getDataVersions')
const getGameVersions = require('../../getGameVersions')

const { dataVersions } = require('helpers/dataVersions')
const { gameData } = require('helpers/gameData')
const dataBuilder = require('../dataBuilder')
const dataUpdate = require('../dataUpdate')
const mapPlatoons = require('../mapPlatoons')
let updateInProgress = false
module.exports = async(forceFile = false)=>{
  try{
    if(updateInProgress) return
    let versions = await getGameVersions()
    if(!versions?.gameVersion || !versions?.localeVersion || !versions?.assetVersion) return
    let gitVersions = await getDataVersions()
    if(!gitVersions?.gameVersion || !gitVersions?.localeVersion) return
    if(!forceFile && dataVersions.gameVersion === versions.gameVersion && dataVersions.localeVersion === versions.localeVersion && gameData.version === versions.gameVersion) return
    updateInProgress = true
    let status = await dataUpdate(versions.gameVersion, versions.localeVersion, versions.assetVersion, forceFile)
    if(status) await dataBuilder(versions.gameVersion, versions.localeVersion, forceFile)
    updateInProgress = false
    if(status) await mapPlatoons()
  }catch(e){
    updateInProgress = false
    throw(e);
  }
}
