const config = require("../../config.json");
var db = require('quick.db')
const { ActivityType, Activity, EmbedBuilder } = require('discord.js');
module.exports = async (Discord, client) => {
    try {
        client.user.setPresence({ activities: [{ name: "Myself be Developed", type: 3 }], status: 'online' });
    } catch (err) {
        console.log(`There was an error setting the client activity: ${err}`)
    }
    const logChannelId = client.guilds.cache.get(config.guildid).channels.cache.get(config.logchannelid);
    let embed = new EmbedBuilder()
        .setDescription(`Bot has been enabled.`)
        .setColor(config.success_embed_color)
        .setTimestamp()
        .setFooter({text: config.footer});
    await logChannelId.send({ embeds: [embed] })
    console.log("Bot online!")
}