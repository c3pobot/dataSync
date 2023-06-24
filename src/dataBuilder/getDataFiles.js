'use strict'
const path = require('path')
const fs = require('fs')
const Fetch = require('../fetch')
const SaveFile = requir('../saveFile')
const dataUrl = process.env.GITHUB_DATA_URI || 'https://raw.githubusercontent.com/swgoh-utils/gamedata/main'
const fileArray = ['equipment.json', 'relicTierDefinition.json', 'skill.json', 'statMod.json', 'statModSet.json', 'statProgression.json', 'table.json', 'units.json', 'xpTable.json']

module.exports = async(gameVersion, localeVersion, forceFile = false)=>{
  try{
    let count = 0
    for(let i in fileArray){
      const status = await SaveFile(fileArray[i], gameVersion, forceFile)
      if(status === true) count++;
    }
    if(count === 0 || count !== +fileArray?.length) return false
    return await SaveFile('Loc_ENG_US.txt.json', localeVersion)
  }catch(e){
    console.error(e);
  }
}
