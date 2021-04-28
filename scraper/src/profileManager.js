const fs = require('fs');
const { resolve } = require('path');
const path = require('path');
const rimraf = require('rimraf');

const directories = [
  "browserData",
  "browserData/browserProfile",
]

module.exports = {
  clear: async function() {
    return new Promise(async (resolve) => {
      const directory = './browserData/browserProfile/cache2/';
      check = await clear(directory)

      resolve(check)
    })
  },
  init: () => {
    return new Promise(resolve => {
      console.log("initiating profile manager");

      directories.forEach(dir => {
        if(!fs.existsSync(dir)) {
          console.log(`created directory ${dir}`);

          fs.mkdirSync(dir)
        }
      })

      resolve(true)
    })
  }
}

function clear(directory) {
  return new Promise(resolve => {
    if (fs.existsSync(directory)) {
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
    }
  
    console.log("> cleared cache")

    resolve(true)
  })
}