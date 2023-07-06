'use strict'
const { readFile } = require('./helper')
const mongo = require('mongoapiclient')
const getRecipeList = async(recipeList, lang)=>{
  try{
    let list = recipeList.map(r=>{
      if(r.ingredients.length > 0){
        return Object.assign({}, {
          id: r.id,
          ingredients: r.ingredients,
          result: r.result,
          nameKey: (lang[r.descKey] || r.descKey)
        })
      }
    })
    return list;
  }catch(e){
    throw(e)
  }
}
module.exports = async(gameVersion, localeVersion, assetVersion)=>{
  try {
    let lang = await readFile('Loc_ENG_US.txt.json', localeVersion)
    let equipmentList = await readFile('equipment.json', gameVersion)
    let recipeList = await readFile('recipe.json', gameVersion)
    let recipeMap = await getRecipeList(recipeList, lang)
    if(!equipmentList || !lang || !recipeMap) return
    equipmentList.forEach(x=>{
      let tempObj = {
        id: x.id,
        nameKey: (lang[x.nameKey] || x.nameKey),
        iconKey: x.iconKey,
        tier: x.tier,
        mark: x.mark,
        recipeId: x.recipeId
      }
      let recipe = recipeMap.find(y=>y.id == x.recipeId)
      tempObj.recipe = recipe?.ingredients || []
      mongo.set('equipmentList', {_id: x.id}, tempObj)
    })
    equipmentList = null, lang = null, recipeList = null
    return true
  } catch (e) {
    throw(e);
  }
}
