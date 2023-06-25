'use strict'
const ReadFile = require('./readFile')
module.exports = async(gameVersion, localeVersion)=>{
  try{
    let lang = await ReadFile('Loc_ENG_US.txt.json', localeVersion)
    let recipeList = await ReadFile('recipe.json', gameVersion)
    if(lang || !recipeList) return
    const list = obj.map(r=>{
      if(r.ingredients.length > 0){
        return Object.assign({}, {
          id: r.id,
          ingredients: r.ingredients,
          result: r.result,
          nameKey: (lang[r.descKey] || r.descKey)
        })
      }
    })
    obj = null;
    lang = null;
    return list;
  }catch(e){
    console.error(e)
  }
}
