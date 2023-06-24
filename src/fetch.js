'use strict'
const fetch = require('node-fetch')
const convert2base64 = (img)=>{
  try{
    if(!img) return
    let res = Buffer.from(img)
    if(res) res = res.toString('base64')
    return res
  }catch(e){
    console.error(e);
  }
}
module.exports.json = async(uri, method = 'GET', body, headers)=>{
  try{
    let payload = { method: method, compress: true, timeout: 60000 }
    if(body) payload.body = JSON.stringify(body)
    if(headers) payload.headers = headers
    const obj = await fetch(uri, payload)
    return await obj?.json()
  }catch(e){
    console.error(e);
  }
}
module.exports.image = async(uri)=>{
  try{
    let img
    const obj = await fetch(uri, {
      method: 'GET',
      compress: true,
      timeout: 60000
    })
    if(obj) img = await obj?.arrayBuffer()
    if(img) return await convert2base64(img)
  }catch(e){
    console.error(e);
  }
}
