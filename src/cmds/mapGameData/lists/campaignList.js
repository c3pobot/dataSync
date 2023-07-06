'use strict'
const { readFile } = require('./helper')
const mongo = require('mongoapiclient')
let errored = false
const getEnergy = async(energy)=>{
  try{
    let res = {
      id: energy[0].id,
      type: energy[0].type,
      qty: energy[0].minQuantity
    }
    for(let i in energy){
      if(energy[i].minQuantity > res.qty){
        res = {
          id: energy[i].id,
          type: energy[i].type,
          qty: energy[i].minQuantity
        }
      }
    }
    return res
  }catch(e){
    throw(e)
  }
}
const getReward = async(reward, data = {})=>{
  try{
    if(!reward.id || reward.id.includes('GRIND') || reward.id.includes('xp-mat') || reward.id.includes('FORCE_POINT') || reward.id.includes('ability_mat')) return
    let tempReward = {
      id: reward.id,
      qty: reward.maxQuantity
    }
    let gear = data.equipmentList?.find(x=>x.id === reward.id)
    if(gear){
      tempReward.nameKey = data.lang[gear.nameKey] || gear.nameKey;
      tempReward.icon = gear.iconKey
      tempReward.gear = true
      tempReward.mod = false
      tempReward.tier = gear.tier
      tempReward.mark = gear.mark
    }
    if(tempReward.nameKey) return tempReward
    let material = data.materialList?.find(x=>x.id === reward.id)
    if(material){
      tempReward.nameKey = data.lang[material.nameKey] || material.nameKey;
      tempReward.icon = material.iconKey
      tempReward.gear = false
      tempReward.mod = false
    }
    if(tempReward.nameKey) return tempReward
    let tempMod = data.mysteryModList.find(x=>x.id == reward.id)
    if(tempMod){
      tempReward.nameKey = data.lang['StatMod_Name_Rarity_'+tempMod.minRarity]
      let modSet = data.modSetList.find(x=>x.id == tempMod.setId)
      if(modSet) tempReward.nameKey += data.lang[modSet.name] || modSet.name

      if(tempMod.slot?.length === 1) tempReward.nameKey += ' '+data.lang['StatMod_Name_Slot_'+(+tempMod.slot[0] - 1)]
      tempReward.gear = false
      tempReward.mod = true
    }
    return tempReward
  }catch(e){
    throw(e)
  }
}
const getRewards = async(rewards, data = {})=>{
  try{
    let res = []
    for(let i in rewards){
      if(errored) return
      let reward = await getReward(rewards[i], data)
      if(reward) res.push(reward)
    }
    return res
  }catch(e){
    throw(e)
  }
}
const getMission = async(mission, data = {})=>{
  try{
    if(!mission) throw('campaignNodeMission missing in getCampaignNodeMission')
    if(!mission.grindEnabled) return true
    let res = {
      id: data.campaignId+'-'+data.campaignMapId+'-'+data.campaignNodeDifficulty+'-'+data.campaignNodeId+'-'+mission.id,
      campaignMissionIdentifier: {
        campaignId: data.campaignId,
        campaignMapId:  data.campaignMapId,
        campaignNodeDifficulty: +data.campaignNodeDifficulty,
        campaignNodeId: data.campaignNodeId,
        campaignMissionId: data.campainMissionId,
      },
      mapNameKey: data.mapNameKey,
      missionNameKey: data.lang[mission.shortNameKey] || mission.shortNameKey,
      rewards: [],
      energy: null
    }
    let actionCap = data.actionCapList.find(x=>x.id == mission.dailyBattleCapKey)
    if(actionCap?.maxActions) res.dailyBattleCapKey = +actionCap.maxActions
    if(mission.rewardPreview){
      let rewards = await getRewards(mission.rewardPreview, data)
      if(rewards){
        res.rewards = rewards
      }else{
        errored = true
      }
    }
    if(mission.entryCostRequirement?.length > 0){
      let energy = await getEnergy(mission.entryCostRequirement)
      if(energy){
        res.energy = energy
      }else{
        errored = true
      }
    }
    if(!errored){
      await mongo.set('campaignList', {_id: res.id}, res)
      return true
    }
  }catch(e){
    throw(e)
  }
}
const getCampaignNodeMission = async(campaignNodeMission, data = {})=>{
  try{
    if(!campaignNodeMission) throw('campaignNodeMission missing in getCampaignNodeMission')
    for(let i in campaignNodeMission){
      if(errored) return
      let status = await getMission(campaignNodeMission[i], data)
      if(!status) throw('getMission error')
    }
    if(!errored) return true
  }catch(e){
    throw(e)
  }
}
const getCampainNode = async(campainNode, data = {})=>{
  try{
    if(!campainNode) throw('campainNode missing in getCampainNode')

    for(let i in campainNode){
      if(errored) return
      data.campaignNodeId = campainNode[i].id
      let status = await getCampaignNodeMission(campainNode[i].campaignNodeMission, data)
      if(!status) throw('getCampaignNodeMission error')
    }
    if(!errored) return true
  }catch(e){
    throw(e)
  }
}
const getCampaignNodeDifficultyGroup = async(campaignNodeDifficultyGroup, data = {})=>{
  try{
    if(!campaignNodeDifficultyGroup) throw('campaignNodeDifficultyGroup missing in getCampaignNodeDifficultyGroup')

    for(let i in campaignNodeDifficultyGroup){
      if(errored) return
      data.campaignNodeDifficulty = campaignNodeDifficultyGroup[i].campaignNodeDifficulty
      let status = await getCampainNode(campaignNodeDifficultyGroup[i].campaignNode, data)
      if(!status) throw('getCampainNode error')
    }
    if(!errored) return true
  }catch(e){
    throw(e)
  }
}
const getCampainMap = async(campainMap, data = {})=>{
  try{
    if(!campainMap) throw('campainMap missing in getCampainMap')

    for(let i in campainMap){
      if(errored) return
      data.campaignMapId = campainMap[i].id
      let status = await getCampaignNodeDifficultyGroup(campainMap[i].campaignNodeDifficultyGroup, data)
      if(!status) throw('getCampaignNodeDifficultyGroup error')
    }
    if(!errored) return true
  }catch(e){
    throw(e)
  }
}
module.exports = async(gameVersion, localeVersion, assetVersion)=>{
  try{
    errored = false
    let lang = await readFile('Loc_ENG_US.txt.json', localeVersion)
    let campaignList = await readFile('campaign.json', gameVersion)
    if(campaignList) campaignList = campaignList.filter(x=>x.grindEnabled)
    let actionCapList = await readFile('dailyActionCap.json', gameVersion)
    let equipmentList = await readFile('equipment.json', gameVersion)
    let materialList = await readFile('material.json', gameVersion)
    let mysteryModList = await readFile('mysteryStatMod.json', gameVersion)
    let modSetList = await readFile('statModSet.json', gameVersion)
    if(!lang || !campaignList || !actionCapList || !equipmentList || !materialList || !mysteryModList || !modSetList) return

    for(let i in campaignList){
      if(errored) return
      let mapNameKey = lang[campaignList[i].nameKey] || campaignList[i].nameKey
      mapNameKey = mapNameKey?.replace(/\\n/g, ' ').replace(' BATTLES', '')
      let status = await getCampainMap(campaignList[i].campaignMap, { campaignId: campaignList[i].id, mapNameKey: mapNameKey, lang: lang, actionCapList: actionCapList, equipmentList: equipmentList, materialList: materialList, mysteryModList: mysteryModList, modSetList: modSetList })
      if(!status) throw('getCampainMap error')
    }
    campaignList = null, lang = null, actionCapList = null, equipmentList = null, materialList = null, mysteryModList = null, modSetList = null
    if(!errored) return true
  }catch(e){
    throw(e)
  }
}
