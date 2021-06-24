const readline = require("readline");
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function init() {
    title = await ask("Enter Title")
    console.log(title);
}

function ask(question) {  
    return new Promise(resolve => {
        rl.question(`${question}: `, (answer) => {
            resolve(answer)
        });
    })
}
init()

