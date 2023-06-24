'use strict'
const path = require('path')
const fs = require('fs')
const DATA_PATH = process.env.DATA_PATH || path.join(baseDir, 'data')
module.exports = async(file)=>{
  try{
    const obj = fs.readFileSync(path.join(DATA_PATH, file))
    if(obj){
      obj = JSON.parse(obj)
      return obj?.data
    }
  }catch(e){
    console.log('error reading '+file)
  }
}
