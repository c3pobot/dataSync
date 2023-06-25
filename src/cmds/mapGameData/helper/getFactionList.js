'use strict'
const ReadFile = require('./readFile')
const altName = {'species_wookiee_ls': 'Light Side Wookiee'}
module.exports = async(gameVersion, localeVersion)=>{
  try {
    let lang = await ReadFile('Loc_ENG_US.txt.json', localeVersion)
    let categoryList = await ReadFile('category.json', gameVersion)
    if(!obj || !lang) return
    const list = {}
    categoryList.forEach(f=>{
      //if(f.id && !f.id.startsWith('special') && f.descKey && f.uiFilter && f.uiFilter.length > 0 && lang[f.descKey] && lang[f.descKey] != 'Placeholder'){
      if(f.id){
        if(altName[f.id]){
          list[f.id] = {
            baseId: f.id,
            nameKey: altName[f.id],
            search: altName[f.id]?.toLowerCase(),
            uiFilter: false,
            units:[]
          }
        }else{
          list[f.id] = {
            baseId: f.id,
            nameKey: lang[f.descKey],
            search: lang[f.descKey]?.toLowerCase(),
            uiFilter: (f.uiFilter?.length > 0 ? true:false),
            units:[]
          }
        }
      }
    })
    lang = null
    categoryList = null
    return list
  } catch (e) {
    console.error(e)
  }
}
