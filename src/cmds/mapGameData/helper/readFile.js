const path = require('path')
const fs = require('fs')
const DATA_PATH = process.env.DATA_PATH || path.join(baseDir, 'data')
const ReadFile = async(file, version)=>{
  try{
    if(!file || !version) return
    const obj = fs.readFileSync(path.join(DATA_PATH, file))
    if(obj?.data && obj?.version && obj?.version === version) return JSON.parse(obj.data)
  }catch(e){
    console.log('error reading '+file)
  }
}
