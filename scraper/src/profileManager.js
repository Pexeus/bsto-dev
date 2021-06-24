const fs = require('fs-extra');
const bash = require("shelljs")
const path = require('path');
const rimraf = require('rimraf');

const directories = [
  "browserData",
  "browserData/browserProfile",
  "browserData/browserProfileClean",
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
      console.log("[PM] initiating profile manager");

      directories.forEach(dir => {
        if(!fs.existsSync(dir)) {
          console.log(`[PM] created directory ${dir}`);

          fs.mkdirSync(dir)
        }
      })

      resolve(true)
    })
  },
  resetProfile: async () => {
    return new Promise(async resolve => {
      console.log("[PM] resetting current profile")

      await bash.rm("-rf", "./browserData/browserProfile")
      await bash.cp("-rf", "./browserData/browserProfileClean", "./browserData/browserProfile");

      setTimeout(() => {
        resolve(true)
      }, 3000);
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

    resolve(true)
  })
}