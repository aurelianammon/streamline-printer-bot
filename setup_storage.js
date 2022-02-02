const storage = require('node-persist');

//you must first call storage.init
async function init() {
    await storage.init( /* options ... */ );
    await storage.setItem('chat_list', [])
    console.log(await storage.getItem('chat_list'));
}

init()