'use strict'
const ReadFile = require('./readFile')
const GetRecipeList = require('./getRecipeList')
module.exports = async(gameVersion, localeVersion, assetVersion)=>{
  try {
    console.log('equipmentList updating ...')
    let equipmentList = await ReadFile('equipment.json', gameVersion)
    let lang = await ReadFile('Loc_ENG_US.txt.json', localeVersion)
    let recipeList = await GetRecipeList(gameVersion, localeVersion, assetVersion)
    if(!equipmentList || !lang || !recipeList) return
    equipmentList.forEach(x=>{
      let tempObj = {
        id: x.id,
        nameKey: (lang[x.nameKey] || x.nameKey),
        iconKey: x.iconKey,
        tier: x.tier,
        mark: x.mark,
        recipeId: x.recipeId
      }
      let recipe = recipeList.find(y=>y.id == x.recipeId)
      tempObj.recipe = recipe?.ingredients || []
      mongo.set('equipmentList', {_id: x.id}, tempObj)
    })
    equipmentList = null, lang = null, recipeList = null
    console.log('equipmentList updated...')
  } catch (e) {
    console.error('equipmentList update error...');
  }
}
