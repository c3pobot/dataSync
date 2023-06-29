'use strict'
process.on('unhandledRejection', (error) => {
  console.log(error)
});
global.mongoReady = false
global.baseDir = __dirname;
require('./src')
