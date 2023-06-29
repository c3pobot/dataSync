'use strict'
const { readFile } = require('./helper')

let errored = false
const getMission = async(nodeId, data = {})=>{
  try{
    if(!nodeId) throw('nodeId missing in getMissions')
    let tempName = nodeId.slice(0, -1)
    if(data.sector?.missions?.filter(x=>x === tempName).length === 0){
      data.sector.missions.push(tempName)
      data.sector.stars += 3
      data.stars += 3
    }
    if(!errored) return true
  }catch(e){
    throw(e)
  }
}
const getNode = async(sectorNode, data = {})=>{
  try{
    if(!sectorNode) throw('sectorNode missing in getNode')
    for(let i in sectorNode){
      if(errored) return
      let status = await getMission(sectorNode[i].id, data)
      if(!status) errored = true
    }
    if(!errored) return true
  }catch(e){
    throw(e)
  }
}
const getSector = async(sector, data = {})=>{
  try{
    if(!sector) throw('sector missing in getSector')
    let res = []
    for(let i in sector){
      if(errored) return
      data.sector = { missions: [], stars: 0 }
      let status = await getNode(sector[i].node.filter(x=>x.type === 1 || x.type === 5), data)
      if(status){
        let tempObj = JSON.parse(JSON.stringify(sector[i]))
        tempObj.nameKey = data.lang[tempObj.nameKey] || tempObj.nameKey
        tempObj.titleKey = data.lang[tempObj.titleKey] || tempObj.titleKey
        tempObj.environmentTitleKey = data.lang[tempObj.environmentTitleKey] || tempObj.environmentTitleKey
        tempObj.stars = data.sector.stars
        tempObj.missions = JSON.parse(JSON.stringify(data.sector.missions))
        res.push(tempObj)
      }else{
        errored = true
      }
    }
    if(!errored) return res
  }catch(e){
    throw(e)
  }
}
const getConquestDifficulty = async(conquestDifficulty, data = {})=>{
  try{
    if(!conquestDifficulty) throw('conquestDifficulty missing in getConquestDifficulty')
    for(let i in conquestDifficulty){
      if(errored) return
      data.stars = 0
      data.nodes = {}
      let status = await getSector(conquestDifficulty[i].sector, data)
      if(status){
        conquestDifficulty[i].nameKey = data.lang[conquestDifficulty[i].nameKey] || conquestDifficulty[i].nameKey
        conquestDifficulty[i].stars = data.stars
        conquestDifficulty[i].sector = JSON.parse(JSON.stringify(status))
      }else{
        errored = true
      }
    }
    if(!errored) return true
  }catch(e){
    throw(e)
  }
}
module.exports = async(gameVersion, localeVersion, assetVersion)=>{
  try{
    errored = false
    let conquestDefinition = await readFile('conquestDefinition.json', gameVersion)
    let lang = await readFile('Loc_ENG_US.txt.json', localeVersion)

    if(!conquestDefinition || !lang) return
    for(let i in conquestDefinition){
      if(errored) throw('error with conquestDefinitionList...');
      let res = conquestDefinition[i]
      res.nameKey = lang[res.nameKey] || res.nameKey
      res.descriptionKey = lang[res.descriptionKey] || res.descriptionKey
      let status = await getConquestDifficulty(res.conquestDifficulty, {lang: lang})
      if(status){
        await mongo.set('conquestDefinitionList', {_id: res.id}, res)
      }else{
        errored = true
      }
    }
    conquestDefinition = null
    if(!errored) return true
  }catch(e){
    throw(e)
  }
}
