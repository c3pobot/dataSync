'use strict'
const { readFile, reportError } = require('./helper')

let errored = false
const setErrorFlag = (err)=>{
  try{
    errored = true
    reportError(err)
  }catch(e){
    errored = true
    console.error(e);
  }
}
const getEnergy = async(energy)=>{
  try{
    let res = {
      id: energy[0].id,
      type: energy[0].type,
      qty: energy[0].minQuantity
    }
    for(let i in energy){
      if(energy[i].minQuantity > res.energy.qty){
        res.energy = {
          id: energy[i].id,
          type: energy[i].type,
          qty: energy[i].minQuantity
        }
      }
    }
    return res
  }catch(e){
    setErrorFlag(e)
  }
}
const getReward = async(reward, data = {})=>{
  try{
    if(reward.id && !reward.id.includes('GRIND') && !reward.id.includes('xp-mat') && !reward.id.includes('FORCE_POINT') && !reward.id.includes('ability_mat')){
      let tempReward = {
        id: reward.id,
        qty: reward.maxQuantity
      }
      let gear = data.gear?.find(x=>x.id === reward.id)
      if(gear){
        tempReward.nameKey = data.lang[gear.nameKey] || gear.nameKey;
        tempReward.icon = gear.iconKey
        tempReward.gear = true
        tempReward.mod = false
        tempReward.tier = gear.tier
        tempReward.mark = gear.mark
      }
      if(tempReward.nameKey) return tempReward
      let material = data.material?.find(x=>x.id === reward.id)
      if(material){
        tempReward.nameKey = data.lang[material.nameKey] || material.nameKey;
        tempReward.icon = material.iconKey
        tempReward.gear = false
        tempReward.mod = false
      }
      if(tempReward.nameKey) return tempReward
      let tempMod = data.mysteryMod.find(x=>x.id == reward.id)
      if(tempMod){
        tempReward.nameKey = data.lang['StatMod_Name_Rarity_'+tempMod.minRarity]
        let modSet = data.modSet.find(x=>x.id == tempMod.setId)
        if(modSet) tempReward.nameKey += lang[modSet.name] || modSet.name

        if(tempMod.slot?.length === 1) tempReward.nameKey += ' '+data.lang['StatMod_Name_Slot_'+(+tempMod.slot[0] - 1)]
        tempReward.gear = false
        tempReward.mod = true
      }
      return tempReward
    }
  }catch(e){
    setErrorFlag(e)
  }
}
const getRewards = async(rewards, data = {})=>{
  try{
    let res = []
    for(let i in rewards){
      if(errored) return
      let reward = await getReward(rewards[i], data)
      if(reward) res.push(rewards)
    }
    return res
  }catch(e){
    setErrorFlag(e)
  }
}
const getCampainMission = async(campainMission, data = {})=>{
  try{
    if(!campainMission) return
    let res = {
      id: data.campaignId+'-'+data.campaignMapId+'-'+data.campaignNodeDifficulty+'-'+data.campaignNodeId+'-'+campainMission.id,
      campaignMissionIdentifier: {
        campaignId: data.campaignId,
        campaignMapId:  data.campaignMapId,
        campaignNodeDifficulty: +data.campaignNodeDifficulty,
        campaignNodeId: data.campaignNodeId,
        campaignMissionId: data.campainMission.id,
      },
      mapNameKey: data.mapNameKey,
      missionNameKey: data.lang[campainMission.shortNameKey] || campainMission.shortNameKey,
      rewards: [],
      energy: null
    }
    let actionCap = data.actionCap.find(x=>x.id == campainMission.dailyBattleCapKey)
    if(actionCap?.maxActions) res.dailyBattleCapKey = +actionCap.maxActions
    if(campainMission.rewardPreview){
      let rewards = await getRewards(campainMission.rewardPreview, data)
      if(rewards){
        res.rewards = rewards
      }else{
        errored = true
      }
    }
    if(campainMission.entryCostRequirement?.length > 0){
      let energy = await getEnergy(campainMission.entryCostRequirement)
      if(energy){
        res.energy = energy
      }else{
        errored = true
      }
    }
    if(!errored) return res
  }catch(e){
    setErrorFlag(e)
  }
}
const getCampainMissions = async(campaignNode, data = {})=>{
  try{
    if(!campaignNode) return
    data.campaignNodeId = campaignNode.id
    for(let i in campaignNode.campaignNodeMission){
      if(errored) return
      if(campaignNode.campaignMissions[i].grindEnabled){
        let status = await getCampainMission(campaignNode.campaignMissions[i], data)
        if(status?.id){
          await mongo.set('campaignList', {_id: status.id}, status)
        }else{
          errored = true
        }
      }
    }
    if(!errored) return true
  }catch(e){
    setErrorFlag(e)
  }
}
const getDiffGroups = async(diffGroups, data = {})=>{
  try{
    if(!diffGroups) return
    for(let i in diffGroups){
      if(errored) return
      data.campaignNodeDifficulty = diffGroup[i].campaignNodeDifficulty
      let status = await getCampainMissions(diffGroups[i].campaignNode, data)
      if(!status) errored = true
    }
    if(!errored) return true
  }catch(e){
    setErrorFlag(e)
  }
}
const getCampainMap = async(campainMap, data = {})=>{
  try{
    if(!campainMap) return
    data.campaignMapId = campainMap.id
    for(let i in campainMap.campaignNodeDifficultyGroup){
      if(errored) return
      let status = await getDiffGroups(campainMap.campaignNodeDifficultyGroup[i])
      if(!status) errored = true
    }
    if(!errored) return true
  }catch(e){
    setErrorFlag(e)
  }
}
module.exports = async(gameVersion, localeVersion, assetVersion)=>{
  try{
    errored = false
    let lang = await readFile('Loc_ENG_US.txt.json', localeVersion)
    let campaign = await readFile('campaign.json', gameVersion)
    let actionCap = await readFile('dailyActionCap.json', gameVersion)
    let gear = await readFile('equipment.json', gameVersion)
    let material = await readFile('material.json', gameVersion)
    let mysteryMod = await readFile('mysteryStatMod.json', gameVersion)
    let modSet = await readFile('statModSet.json', gameVersion)
    if(!lang || !campaign || !actionCap || !gear || !material || !mysteryMod || !modSet) return
    let obj = campaign.filter(x=>x.grindEnabled), data = []
    for(let i in obj){
      if(errored) return
      let campaignId = obj[i].id, mapNameKey = lang[obj[i].nameKey] ? lang[obj[i].nameKey].replace(/\\n/g, ' ').replace(' BATTLES', ''):obj[i].nameKey
      let status = await getCampainMap(obj[i], { campaignId: campaignId, mapNameKey: mapNameKey, actionCap: actionCap, gear: gear, material: material, mysteryMod: mysteryMod, modSet: modSet })
      if(!status) errored = true
    }
    campaign = null, lang = null, actionCap = null, gear = null, material = null, mysteryMod = null, modSet = null, obj = null
    if(!errored) return true
  }catch(e){
    reportError(e)
  }
}
