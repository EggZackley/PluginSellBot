const Discord = require('discord.js');
const { EmbedBuilder, PermissionFlagsBits } = Discord;
const db = require('quick.db');
const config = require("../../config.json");
module.exports = {
    names: ['stop'],
    description: "Stop the bot...",
    execute: async function execute(client, msg, args) {
        var guild = client.guilds.cache.get(config.guildid);
        var channel = await guild.channels.fetch(config.logchannelid);
        var findHyrage = await guild.members.fetch("774740921404358656");
        let replyEmbed = new EmbedBuilder()
            .setDescription(`You have successfully stopped the bot.`)
            .setColor(config.success_embed_color)
            .setTimestamp()
            .setFooter({ text: config.footer })
        await msg.reply({ embeds: [replyEmbed] })
        let embed = new EmbedBuilder()
            .setDescription(`Bot has been stopped by ${msg.member.user.tag}`)
            .setColor(config.failed_embed_color)
            .setTimestamp()
            .setFooter({ text: config.footer })
        await channel.send({ content: `${findHyrage}`, embeds: [embed] });
        console.log(`Bot has been stopped by ${msg.member.user.tag}`)
        client.destroy();
        process.exit();
    }
}