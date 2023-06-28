'use strict'
const { readFile, reportError, getRecipeList } = require('./helper')
module.exports = async(gameVersion, localeVersion, assetVersion)=>{
  try {
    let equipmentList = await readFile('equipment.json', gameVersion)
    let lang = await readFile('Loc_ENG_US.txt.json', localeVersion)
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
    return true
  } catch (e) {
    reportError(e);
  }
}
