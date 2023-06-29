'use strict'
const { readFile } = require('./helper')
let tierEmum
const createTierEnum = ()=>{
  try{
    for(let i = 1;i<11;i++){
      if(!tierEmum) tierEmum = {}
      tierEmum['relic_promotion_recipe_'+i.toString().padStart(2, '0')] = i
    }
  }catch(e){
    throw(e);
  }
}
const getIngredients = (ingredients = [], data = {})=>{
  try{
    if(ingredients.length === 0) return []
    let res = []
    for(let i in ingredients){
      if(ingredients[i].id === 'GRIND') continue
      let mat = data.materialList?.find(x=>x.id === ingredients[i].id)
      if(!mat) continue
      let tempObj = {
        id: ingredients[i].id,
        qty: ingredients[i].minQuantity,
        nameKey: data.lang[mat?.nameKey] || mat?.nameKey,
        iconKey: mat?.iconKey
      }
      res.push(tempObj)
    }
    return res
  }catch(e){
    throw(e)
  }
}
createTierEnum()
module.exports = async(gameVersion, localeVersion, assetVersion)=>{
  try{
    let lang = await readFile('Loc_ENG_US.txt.json', localeVersion)
    let recipeList = await readFile('recipe.json', gameVersion)
    let materialList = await readFile('material.json', gameVersion)
    let relicList = recipeList?.filter(x=>x.id.startsWith('relic_'))
    if(!lang || !recipeList || !materialList || !relicList || relicList?.length === 0) return

    let gameData = {materialList: materialList, relicList: relicList, lang: lang}
    for(let i in relicList){
      if(!tierEmum[relicList[i].id]) continue
      let tier = tierEmum[relicList[i].id]
      let recipe = {
        id: 'relic-'+tier,
        tier: tier,
        type: 'relic',
        ingredients: []
      }
      recipe.ingredients = await getIngredients(relicList[i].ingredients, gameData)
      await mongo.set('relicRecipeList', {_id: recipe.id}, recipe)
    }
    return true
  }catch(e){
    throw(e);
  }
}
