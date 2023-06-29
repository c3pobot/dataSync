'use strict'
const fetch = require('node-fetch')
const convert2base64 = async(res)=>{
  try{
    if(res?.status?.toString().startsWith(2)){
      let img = await res.arrayBuffer()
      img = Buffer.from(img)
      if(img) return img.toString('base64')
    }
  }catch(e){
    console.error(e);
  }
}
const getJsonResponse = async(res)=>{
  try{
    let body
    if (res?.status?.toString().startsWith('2')){
      body = await res?.json()
      if(!body) body = res?.status
    }
    return body
  }catch(e){
    throw(e)
  }
}
module.exports.json = async(uri, method = 'GET', body, headers)=>{
  try{
    let payload = { method: method, compress: true, timeout: 60000 }
    if(body) payload.body = JSON.stringify(body)
    if(headers) payload.headers = headers
    const obj = await fetch(uri, payload)
    return await getJsonResponse(obj)
  }catch(e){
    throw(e);
  }
}
module.exports.image = async(uri)=>{
  try{
    const obj = await fetch(uri, {
      method: 'GET',
      compress: true,
      timeout: 60000
    })
    return await convert2base64(obj)
  }catch(e){
    throw(e);
  }
}
