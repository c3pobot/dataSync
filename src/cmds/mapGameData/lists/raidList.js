'use strict'
const { readFile } = require('./helper')
const CheckImages = require('./checkImages')

const raidTokens = {
  RAID_REWARD_CURRENCY_01: { nameKey: 'Shared_Currency_RaidReward_01', icon: 'tex.guild_raid_personal' },
  RAID_REWARD_CURRENCY_02: { nameKey: 'Shared_Currency_RaidReward_02', icon: 'tex.guild_raid_general' },
  RAID_REWARD_CURRENCY_03: { nameKey: 'Shared_Currency_RaidReward_03', icon: 'tex.guild_raid_special' },
  RAID_REWARD_CURRENCY_04: { nameKey: 'Shared_Currency_RaidReward_04', icon: 'tex.guild_raid_special' }
}
let errored = false
const getLoot = (previewItem = [], data = {})=>{
  try{
    if(!previewItem.length === 0) return
    let res = []
    for(let i in previewItem){
      if(!raidTokens[previewItem[i].id] || errored) continue;
      let loot = JSON.parse(JSON.stringify(raidTokens[previewItem[i].id]))
      if(data.lang[loot.nameKey]) loot.nameKey = data.lang[loot.nameKey]
      loot.qty = previewItem[i].minQuantity
      loot.type = previewItem[i].type
      if(data.images.filter(x=>x === loot.icon).length === 0) data.images.push(loot.icon)
      res.push(loot)
    }
    if(!errored && res.length > 0) return res
  }catch(e){
    throw(e)
  }
}
const getRewards = async(rankRewardPreview = [], data = {})=>{
  try{
    if(rankRewardPreview.length === 0) return
    let res = []
    for(let i in rankRewardPreview){
      if(errored) continue;
      let reward = JSON.parse(JSON.stringify(rankRewardPreview[i].primaryReward[0]))
      reward.rankStart = rankRewardPreview[i].rankStart
      reward.rankEnd = rankRewardPreview[i].rankEnd
      reward.loot = []
      let rewardDef = data.rewardList.find(x=>x.id === reward.id)
      if(!rewardDef) continue
      reward.texture = rewardDef.texture
      reward.nameKey = data.lang[rewardDef.iconTextKey] || rewardDef.iconTextKey
      let loot = await getLoot(rewardDef.previewItem, data)
      if(loot) reward.loot = loot
      res.push(reward)
    }
    if(!errored && res.length > 0) return res
  }catch(e){
    throw(e);
  }
}
const getRequirements = (entryCategoryAllowed, data = {})=>{
  try{
    if(!entryCategoryAllowed) return
    let res = {
      faction: entryCategoryAllowed.categoryId,
      rarity: entryCategoryAllowed.minimumUnitRarity || 0,
      gear: entryCategoryAllowed.minimumUnitTier || 0,
      relic: entryCategoryAllowed.minimumRelicTier || 0
    }
    if(!errored) return res
  }catch(e){
    throw(e)
  }
}
const getMission = async(campaignNodeMission, data = {})=>{
  try{
    if(!campaignNodeMission) return
    let res = {
      id: campaignNodeMission.id,
      nameKey: data.lang[campaignNodeMission.nameKey] || campaignNodeMission.nameKey,
      nameKey: data.lang[campaignNodeMission.descKey] || campaignNodeMission.descKey,
      combatType: campaignNodeMission.combatType,
      rewards:[]
    }
    let requirements = await getRequirements(campaignNodeMission.entryCategoryAllowed)
    if(requirements) res.requirements = requirements
    let rewards = await getRewards(campaignNodeMission.rankRewardPreview, data)
    if(rewards) res.rewards = rewards
    if(!errored) return res
  }catch(e){
    throw(e)
  }
}
const getMissions = async(campaignNodeMission = [], data = {})=>{
  try{
    if(campaignNodeMission.length === 0) return
    let res = []
    for(let i in campaignNodeMission){
      if(errored) continue;
      let mission = await getMission(campaignNodeMission[i], data)
      if(mission) res.push(mission)
    }
    if(!errored && res.length > 0) return res
  }catch(e){
    throw(e)
  }
}
module.exports = async(gameVersion, localeVersion, assetVersion)=>{
  try{
    errored = false
    let lang = await readFile('Loc_ENG_US.txt.json', localeVersion)
    let campainList = await readFile('campaign.json', gameVersion)
    let guildRaidList = await readFile('guildRaid.json', gameVersion)
    let rewardList = await readFile('mysteryBox.json', gameVersion)
    if(!lang || !campainList || !rewardList) return
    let guildCampaign = campainList.find(x=>x.id === 'GUILD')
    let campaignNode = guildCampaign.campaignMap?.find(x=>x.id === 'RAIDS')?.campaignNodeDifficultyGroup[0]?.campaignNode
    if(!campaignNode || !guildCampaign) return

    let autoComplete = [],  gameData = { lang: lang, campaignNode: campaignNode, rewardList: rewardList, images: [], autoComplete: [] }
    for(let i in guildRaidList){
      if(errored) continue;
      let campaign = campaignNode?.find(x=>x.id === guildRaidList[i]?.campaignElementIdentifier?.campaignNodeId)
      if(!campaign) continue;
      let raid = JSON.parse(JSON.stringify(guildRaidList[i]))
      raid.nameKey = lang[campaign.nameKey] || campaign.nameKey
      raid.mission = []
      if(raid.image && gameData.images.filter(x=>x === raid.image).length === 0) gameData.images?.push(raid.image)
      if(raid.portraitIcon && gameData.images.filter(x=>x === raid.image).length === 0) gameData.images?.push(raid.portraitIcon)
      if(raid.infoImage && gameData.images.filter(x=>x === raid.image).length === 0) gameData.images?.push(raid.infoImage)
      let missions = await getMissions(campaign.campaignNodeMission, gameData)
      if(!errored && missions?.length > 0) raid.mission = missions
      if(!errored && raid.mission.length > 0){
        autoComplete.push({name: raid.nameKey, value: raid.id})
        await mongo.set('raidList', {_id: raid.id}, raid)
      }
    }
    if(!errored && gameData.images?.length > 0 && assetVersion) CheckImages(gameData.images, assetVersion, 'thumbnail', 'raidList')
    if(!errored && autoComplete?.length > 0){
      await mongo.set('autoComplete', {_id: 'raid'}, {data: autoComplete, include: true})
      await mongo.set('autoComplete', {_id: 'nameKeys'}, {include: false, 'data.raid': 'raid'})
    }
    guildRaidList = null, campainList = null, rewardList = null, lang = null, guildCampaign = null, campaignNode = null
    if(!errored && autoComplete?.length > 0) return true
  }catch(e){
    throw(e);
  }
}
