'use strict'
process.on('unhandledRejection', (error) => {
  console.log(error)
});
global.baseDir = __dirname;
require('./src')
