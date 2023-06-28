'use strict'
const ReadFile = require('./readFile')
const altName = {'species_wookiee_ls': 'Light Side Wookiee'}
module.exports = async(gameVersion, localeVersion, assetVersion)=>{
  try {
    let lang = await ReadFile('Loc_ENG_US.txt.json', localeVersion)
    let categoryList = await ReadFile('category.json', gameVersion)
    if(!categoryList || !lang) return
    let list = {}
    categoryList.forEach(f=>{
      if(f.id){
        if(altName[f.id]){
          list[f.id] = {
            id: f.id,
            nameKey: altName[f.id],
            uiFilter: (f.uiFilter?.length > 0 ? true:false),
            units:[]
          }
        }else{
          list[f.id] = {
            id: f.id,
            nameKey: lang[f.descKey],
            uiFilter: (f.uiFilter?.length > 0 ? true:false),
            units:[]
          }
        }
      }
    })
    lang = null, categoryList = null
    if(Object.values(list).length > 0) return list
  } catch (e) {
    console.error(e)
  }
}
