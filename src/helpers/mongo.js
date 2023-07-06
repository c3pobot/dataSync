'use strict'
const POD_NAME = process.env.POD_NAME || 'datasync'
const MongoWrapper = require('mongowrapper')
const mongo = new MongoWrapper({
  url: 'mongodb://'+process.env.MONGO_USER+':'+process.env.MONGO_PASS+'@'+process.env.MONGO_HOST+'/',
  authDb: process.env.MONGO_AUTH_DB,
  appDb: process.env.MONGO_DB,
  repSet: process.env.MONGO_REPSET
})
let mongoReady = false
const CheckMongo = async()=>{
  try{
    const status = await mongo.init();
    if(status > 0){
      console.log(POD_NAME+' mongo connection successful...')
      mongoReady = true
    }else{
      console.error(POD_NAME+' mongo connection error...')
      setTimeout(CheckMongo, 5000)
    }
  }catch(e){
    console.error(e);
    setTimeout(CheckMongo, 5000);
  }
}
CheckMongo()
module.exports.mongo = mongo
module.exports.mongoStatus = ()=>{
  return mongoReady
}
