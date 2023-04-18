const fs = require('fs');
const config = require("../config.json");
module.exports = (client, Discord) => {
    const load = dirs => {
        const events = fs.readdirSync(`./events/${dirs}/`).filter(filejs => filejs.endsWith('js'));
        for(let file of events) {
            const evnt = require(`../events/${dirs}/${file}`);
            let eventName = file.split('.')[0];
            client.on(eventName, evnt.bind(null, Discord, client));
        }
    }
    ["client", "guild"].forEach( x => load(x));
}