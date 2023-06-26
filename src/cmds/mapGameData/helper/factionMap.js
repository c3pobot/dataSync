'use strict'
const ReadFile = require('./readFile')
const altName = {'species_wookiee_ls': 'Light Side Wookiee'}
module.exports = async(gameVersion, localeVersion, assetVersion)=>{
  try{
    let lang = await ReadFile('Loc_ENG_US.txt.json', localeVersion)
    let categoryList = await ReadFile('category.json', gameVersion)
    if(categoryList) categoryList = categoryList.filter(x=>x.uiFilter && x.descKey != 'Placeholder' && !x.id.startsWith('special'))
    if(!lang || !categoryList || categoryList?.length === 0) return
    let autoComplete = [], factionMap = {}
    categoryList.forEach(f=>{
      let nameKey = lang[f.descKey]
      if(!nameKey) nameKey = altName[f.descKey]
      if(!nameKey) return
      autoComplete.push({name: nameKey, value: f.id})
      factionMap[f.id] = {id: f.id, nameKey: nameKey }
    })
    if(autoComplete?.length > 0 && Object.values(factionMap)?.length > 0){
      await mongo.set('configMaps', {_id: 'factionMap'}, {data: factionMap})
      await mongo.set('autoComplete', {_id: 'faction'}, {data: autoComplete})
      await mongo.set('autoComplete', {_id: 'nameKeys'}, {include: false, 'data.faction': 'faction'} )
      return true
    }
  }catch(e){
    console.error(e);
  }
}
