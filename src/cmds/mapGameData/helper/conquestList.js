'use strict'
const ReadFile = require('./readFile')
let errored = false
const setErrorFlag = (err)=>{
  try{
    errored = true
    console.error(err)
  }catch(e){
    errored = true
    console.error(e);
  }
}
const getMissions = async(nodeId, data = {})=>{
  try{
    if(!nodeId) return
    const tempName = nodeId.slice(0, -1)
    if(data.sector?.missions?.filter(x=>x == tempName).length === 0){
      data.sector.missions.push(tempName)
      data.sector.stars += 3
      data.stars += 3
    }
    if(!errored) return true
  }catch(e){
    setErrorFlag(e)
  }
}
const getNode = async(sectorNode, sector, data = {})=>{
  try{
    if(!sectorNode || !sector) return
    for(let i in sectorNode){
      if(errored) return
      if(sectorNode[i].type === 1 || sectorNode[i].type === 5){
        let status = await getMissions(sectorNode[i].id, data)
        if(!status) errored = true
      }
    }
    if(!errored) return true
  }catch(e){
    setErrorFlag(e)
  }
}
const getSectors = async(sector, data = {})=>{
  try{
    if(!sector) return
    let res = []
    for(let i in sector){
      if(errored) return
      data.sector = {missions: [], stars: 0}
      let status = await getNode(sector[i].node, data)
      if(status){
        let tempObj = JSON.parse(JSON.stringify(sector[i]))
        tempObj.stars = data.sector.stars
        tempObj.missions = JSON.parse(JSON.stringify(data.sector.missions))
        res.push(tempObj)
      }else{
        errored = true
      }
    }
    if(!errored) return res
  }catch(e){
    setErrorFlag(e)
  }
}
const getDiff = async(conquestDifficulty, data = {})=>{
  try{
    if(!conquestDifficulty) return
    for(let i in conquestDifficulty){
      if(errored) return
      data.stars = 0
      let status = await getSector(conquestDifficulty[i].sector, data)
      if(status){
        conquestDifficulty[i].stars = data.stars
        conquestDifficulty[i].sector = JSON.parse(JSON.stringify(status))
      }else{
        errored = true
      }
    }
    if(!errored) return true
  }catch(e){
    setErrorFlag(e)
  }
}
module.exports = async(gameVersion, localeVersion, assetVersion)=>{
  try{
    errored = false
    let cqDef = await ReadFile('conquestDefinition.json', gameVersion)
    if(!cqDef) return
    for(let x in cqDef){
      if(errored) continue;
      let res = cqDef[x]
      let status = await getDiff(res, {})
      if(status){
        await mongo.set('conquestList', {_id: res.id}, res)
      }else{
        errored = true
      }
    }
    cqDef = null
    if(!errored) return true
  }catch(e){
    console.error(e)
  }
}
