'use strict'
const { gameData } = require('helpers/gameData')
const log = require('logger')
const express = require('express');
const bodyParser = require('body-parser');
const compression = require('compression');
const PORT = process.env.PORT || 3000
const app = express()
app.use(bodyParser.json({
  limit: '500MB',
  verify: (req, res, buf)=>{
    req.rawBody = buf.toString()
  }
}))
app.use(compression());
app.get('/healthz', (req, res)=>{
  res.status(200).json({res: 'ok'})
})
app.get('/version', (req, res)=>{
  try{
    res.status(200).json({version: gameData.version })
  }catch(e){
    log.error(e)
    res.sendStatus(400)
  }
})
app.get('/gameData', (req, res)=>{
  try{
    res.status(200).json(gameData)
  }catch(e){
    log.error(e)
    res.sendStatus(400)
  }
})
app.post('/cmd', (req, res)=>{
  handleRequest(req, res)
})
const server = app.listen(PORT, ()=>{
  log.info('datasync is listening on '+server.address().port)
})
