const Discord = require('discord.js');
const config = require('./config.json')
const { Client, GatewayIntentBits, EmbedBuilder, Collection, Partials, PermissionFlagsBits, AuditLogEvent, Events, AttachmentBuilder } = Discord;
const db = require("quick.db")
const ms = require("ms");
const fs = require("fs");
const default_prefix = config.prefix;
const configPrefix = `${default_prefix}config `
const ticketPrefix = `${default_prefix}ticket `

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessages
    ],
    partials: [
        Partials.Channel,
        Partials.Message,
        Partials.Reaction
    ]
});

client.commands = new Discord.Collection();
client.configCommands = new Discord.Collection();
client.ticketCommands = new Discord.Collection();

const path = require("path");

const getAllFiles = function (dirPath, arrayOfFiles) {
    files = fs.readdirSync(dirPath)

    arrayOfFiles = arrayOfFiles || []

    files.forEach(function (file) {
        if (fs.statSync(dirPath + "/" + file).isDirectory()) {
            arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles)
        } else {
            arrayOfFiles.push(path.join(__dirname, dirPath, "/", file))
        }
    })

    return arrayOfFiles
}

const configFiles = getAllFiles("./commands/configuration", null).filter(file => file.endsWith('.js'));

for (const file of configFiles) {
    const configFile = require(file)

    if (configFile.names == undefined || configFile.names == null) continue;

    for (i = 0; i < configFile.names.length; i++) {
        client.configCommands.set(configFile.names[i], configFile);
    }
}

const generalFiles = getAllFiles("./commands/general", null).filter(file => file.endsWith('.js'));

for (const file of generalFiles) {
    const generalFile = require(file)

    if (generalFile.names == undefined || generalFile.names == null) continue;

    for (i = 0; i < generalFile.names.length; i++) {
        client.commands.set(generalFile.names[i], generalFile);
    }
}

const moderationFiles = getAllFiles("./commands/moderation", null).filter(file => file.endsWith('.js'));

for (const file of moderationFiles) {
    const moderationFile = require(file)

    if (moderationFile.names == undefined || moderationFile.names == null) continue;

    for (i = 0; i < moderationFile.names.length; i++) {
        client.commands.set(moderationFile.names[i], moderationFile);
    }
}

const utilityFiles = getAllFiles("./commands/utility", null).filter(file => file.endsWith('.js'));

for (const file of utilityFiles) {
    const utilityFile = require(file)

    if (utilityFile.names == undefined || utilityFile.names == null) continue;

    for (i = 0; i < utilityFile.names.length; i++) {
        client.commands.set(utilityFile.names[i], utilityFile);
    }
}

const ticketFiles = getAllFiles("./commands/ticket", null).filter(file => file.endsWith('.js'));

for (const file of ticketFiles) {
    const ticketFile = require(file)

    if (ticketFile.names == undefined || ticketFile.names == null) continue;

    for (i = 0; i < ticketFile.names.length; i++) {
        client.ticketCommands.set(ticketFile.names[i], ticketFile);
    }
}

const miscFiles = getAllFiles("./commands/misc", null).filter(file => file.endsWith('.js'));

for (const file of miscFiles) {
    const miscFile = require(file)

    if (miscFile.names == undefined || miscFile.names == null) continue;

    for (i = 0; i < miscFile.names.length; i++) {
        client.commands.set(miscFile.names[i], miscFile);
    }
}

["event"].forEach(handler => {
    require(`./handlers/${handler}`)(client);
})

client.on('messageCreate', async message => {
    const logChannelId = message.guild.channels.cache.get(config.logchannelid)
    let prefix = await db.get(`prefix_${message.guild.id}`);
    if (prefix === null) prefix = default_prefix;
    let config_prefix = `${prefix}config `;
    let ticket_prefix = `${prefix}ticket `;
    let managementRole = await db.get(`management_id_${message.guild.id}`)
    let staffRole = await db.get(`staff_id_${message.guild.id}`)

    if (!managementRole) {
        managementRole = config.managementid;
    }
    if (!staffRole) {
        staffRole = config.staffid
    }

    if (!message.content.startsWith(prefix) || message.author.bot) return;
    if (message.content.startsWith(config_prefix)) {
        if (!message.member.roles.cache.has(managementRole)) {
            if (!message.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
                if (logChannelId == null) {
                    console.log(config.logchannelid)
                    console.log(logChannelId)
                    console.log(`${message.author.tag} tried to use configuration commands, but does not have permission to do so!`)
                    return;
                }
                let embed = new EmbedBuilder()
                    .setDescription(`${message.author.tag} tried to use configuration commands, but does not have permission to do so!`)
                    .setColor(config.embed_color)
                    .setTimestamp()
                    .setFooter({ text: config.footer });
                await logChannelId.send({ embeds: [embed] })
                return;
            }
        }
        const args = message.content.slice(config_prefix.length).split(/ +/);
        const command = args.shift().toLowerCase();

        try {

            if (!client.configCommands.has(command)) return;
            client.configCommands.get(command).execute(client, message, args);
        } catch (err) {
            console.warn(err);
            message.reply("That command is not supported yet.")
        }
    } else if (message.content.startsWith(ticket_prefix)) {
        if (!message.member.roles.cache.has(staffRole)) {
            if (!message.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
                if (logChannelId == null) {
                    console.log(`${message.author.tag} tried to use ticket commands, but does not have permission to do so!`)
                    return;
                }
                let embed = new EmbedBuilder()
                    .setDescription(`${message.author.tag} tried to use ticket commands, but does not have permission to do so!`)
                    .setColor(config.embed_color)
                    .setTimestamp()
                    .setFooter({ text: config.footer })
                await logChannelId.send({ embeds: [embed] })
                return;
            }
        }
        const args = message.content.slice(ticket_prefix.length).split(/ +/);
        const command = args.shift().toLowerCase();

        try {

            if (!client.ticketCommands.has(command)) return;
            client.ticketCommands.get(command).execute(client, message, args);

        } catch (err) {
            console.warn(err);
        }
    } else {

        const args = message.content.slice(prefix.length).split(/ +/);
        const command = args.shift().toLowerCase();

        try {

            if (!client.commands.has(command)) return;

            client.commands.get(command).execute(client, message, args);

        } catch (err) {
            console.warn(err);
        }
    }
});

process.on('SIGINT', async () => {
    setTimeout(() => {
        try {
            console.log("Bot has disconnected")
            client.destroy()
            process.exit()
        } catch (err) {
            console.log(err)
        }
    }, 1000)
    var guild = client.guilds.cache.get(config.guildid);
    var channel = await guild.channels.fetch(config.logchannelid);
    var findHyrage = await guild.members.fetch("774740921404358656");
    let embed = new EmbedBuilder()
        .setDescription(`Bot has been disconnected.`)
        .setColor(config.failed_embed_color)
        .setTimestamp()
        .setFooter({ text: config.footer })
    await channel.send({ content: `${findHyrage}`, embeds: [embed] })
})

client.login(config.token);