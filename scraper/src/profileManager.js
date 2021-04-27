const fs = require('fs');
const path = require('path');
const rimraf = require('rimraf');

module.exports = {
  clear: async function() {
    return new Promise(async (resolve) => {
      const directory = './browserData/browserProfile/cache2/';
      check = await clear(directory)

      resolve(check)
    })
  }
}

function clear(directory) {
  return new Promise(resolve => {
    fs.readdir(directory, (err, files) => {
      if (err) throw err;
    
      for (const file of files) {
        rimraf(path.join(directory, file), function(err) {
          if (err) {
            console.log(err)
            resolve(false)
          }
        })
      }
    });
  
    console.log("> cleared cache")

    resolve(true)
  })
}