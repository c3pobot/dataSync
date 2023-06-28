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
const getTiers = async(tableRows = [], data = {})=>{
  try{
    let res = []
    if(tableRows.length === 0) return res
    for(let i in tableRows){
      if(errored) return
      let recipe = data.recipeList?.find(x=>x.id === tableRows[i].value)
      let ingredients = await getIngredients(recipe?.ingredients, data)
      if(ingredients) res.push({key: tableRows[i].key, value: tableRows[i].value, ingredients: ingredients})
    }
    if(!errored) return res
  }catch(e){
    setErrorFlag(e)
  }
}
const getIngredients = async(ingredients = [], data = {})=>{
  try {
    if(ingredients.length === 0) return ingredients
    for(let i in ingredients){
      if(errored) return
      let equipment = data.equipmentList?.find(x=>x.id === ingredients[i].id)
      if(equipment){
        ingredients[i].nameKey = data.lang[equipment.nameKey] || equipment.nameKey
        ingredients[i].descKey = data.lang[equipment.descKey] || equipment.descKey
        ingredients[i].iconKey = equipment.iconKey
        ingredients[i].sellValue = equipment.sellValue
      }else{
        if(ingredients[i].id !=== 'GRIND') continue
        ingredients[i].nameKey = lang['Shared_Currency_Grind']
        ingredients[i].descKey = lang['Shared_Currency_Grind_Desc_TU13']
        ingredients[i].iconKey = 'tex.goldcreditbar'
      }
    }
    if(!errored) return ingredients
  } catch (e) {
    setErrorFlag(e)
  }
}
module.exports = async(gameVersion, localeVersion, assetVersion)=>{
  try{
    errored = false
    let lang = await readFile('Loc_ENG_US.txt.json', localeVersion)
    let equipmentList = await readFile('material.json', gameVersion)
    let recipeList = await readFile('recipe.json', gameVersion)
    let statModList = await readFile('statMod.json', gameVersion)
    if(statModList) statModList = statModList.filter(x=>x.levelTableId)
    let tableList = await readFile('table.json', gameVersion)
    let xpTableList = await readFile('xpTable.json', gameVersion)

    if(!lang || !equipmentList || !recipeList || !statModList || !tableList || !xpTableList) return
    let gameData = { equipmentList: equipmentList, lang: lang, recipeList: recipeList }
    for(let i in statMod){
      if(errored) continue
      let xpTable = xpTableList.find(x=>x.id === statMod[i].levelTableId)

      let tempObj = { id: statMod[i].id, slot: (+statMod[i].slot - 1), rarity: +statMod[i].rarity, setId: +statMod[i].setId, level : {  id: statMod[i].levelTableId, table: xpTable?.row || [] } }
      if(statMod[i].promotionId){
        let recipe = recipeList.find(x=>x.id === statMod[i].promotionRecipeId)
        tempObj.promotion = { id: statMod[i].promotionId, ingredients: [] }
        let ingredients = await getIngredients(recipe?.ingredients, gameData)
        if(ingredients) tempObj.promotion.ingredients
      }
      if(statMod[i].tierUpRecipeTableId){
        tempObj.tier = {id: statMod[i].tierUpRecipeTableId, tiers: []}
        let table = table.find(x=>x.id === statMod[i].tierUpRecipeTableId)
        let tiers = await getTiers(table?.row, gameData)
        if(tiers) tempObj.tier.tiers = tiers
      }
      await mongo.set('modList', {_id: statMod[i].id}, tempObj)
    }
    lang = null, equipmentList = null, recipeList = null, statModList = null, tableList = null, xpTableList = null
    if(!errored) return true
  }catch(e){
    reportError(e)
  }
}
