'use strict'
const ReadFile = require('./readFile')
module.exports = async(errObj)=>{
  try{
    console.log('Updating Scaveger Data ...')
    let obj = await ReadFile(baseDir+'/data/files/scavengerConversionSet.json')
    let lang = await ReadFile(baseDir+'/data/files/ENG_US.json')
    if(obj && obj.length > 0){
       //await redis.set('scavengerConversionSet', obj)
       const res = []
       for(let i in obj){
         const tempObj = {id: obj[i].output.item.id, pointValue: obj[i].output.item.pointValue, nameKey: (lang[obj[i].output.item.id+'_NAME'] ? lang[obj[i].output.item.id+'_NAME']:obj[i].output.item.id+'_NAME'), gear: []}
         tempObj.gear = obj[i].consumable.map(x=>{
           return Object.assign({}, {
             id: x.id,
             pointValue: x.pointValue
           })
         })
         mongo.set('scavengerGear', {_id: tempObj.id}, tempObj)
         res.push(tempObj)
       }
       //if(res.length > 0) await redis.set('scavengerGear', res)
       errObj.complete++
    }
  }catch(e){
    console.error(e);
    errObj.error++
  }
}
