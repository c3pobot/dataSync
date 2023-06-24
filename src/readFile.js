'use strict'
const fs = require('fs')
module.exports = async(file)=>{
  try{
    const obj = fs.readFileSync(file)
    if(obj) return JSON.parse(obj)
  }catch(e){
    console.log('error reading '+file)
  }
}
