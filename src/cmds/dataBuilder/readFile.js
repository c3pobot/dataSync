'use strict'
const path = require('path')
const fs = require('fs')
const DATA_PATH = process.env.DATA_PATH || path.join(baseDir, 'data')
module.exports = (file, version)=>{
  try{
    if(!file || !version) throw('readFile info not provided '+file+' '+version)
    let obj = fs.readFileSync(path.join(DATA_PATH, file))
    if(obj) obj = JSON.parse(obj)
    if(obj?.data && obj?.version && obj?.version === version) return obj.data
  }catch(e){
    console.error(e);
  }
}
