'use strict'
const { readFile } = require('./helper')
const enumDiff = {I: 8, II: 9, III: 10}
const getDifficulty = (id)=>{
  try{
    let array = id?.split('_')
    let res
    for(let i in array){
      if(enumDiff[array[i]]){
        res = enumDiff[array[i]]
        break
      }
    }
    return res
  }catch(e){
    throw(e);
  }
}
module.exports = async(gameVersion, localeVersion, assetVersion)=>{
  try{
    let challengeList = await readFile('challenge.json', gameVersion)
    if(challengeList) challengeList = challengeList.filter(x=>+x.type === 5)
    let lang = await readFile('Loc_ENG_US.txt.json', localeVersion)
    if(!challengeList || !lang || challengeList?.length === 0) return

    for(let i in challengeList){
      let reward = challengeList[i].reward.find(x=>x.type === 22)
      let difficulty = await getDifficulty(challengeList[i].id)
      if(!difficulty) continue;
      let feat = {
        id: challengeList[i].id,
        nameKey: lang[challengeList[i].nameKey] || challengeList[i].nameKey,
        descKey: lang[challengeList[i].descKey] || challengeList[i].descKey,
        reward: reward?.minQuantity || 0,
        type: challengeList[i].type,
        difficulty: difficulty
      }
      await mongo.set('conquestFeatList', {_id: feat.id}, feat)
    }
    lang = null, challengeList = null
    return true
  }catch(e){
    throw(e)
  }
}
