const Discord = require("discord.js");
const { REST } = require('discord.js/rest');
const { Routes } = require('discord-api-types/v9');
require('dotenv').config()

const client = new Discord.Client({ intents: ["GUILDS", "GUILD_MESSAGES"] });
client.once('ready', () => {
    console.log('Ready!');
});


client.login(process.env.BOT_TOKEN);


function testmessage(et) {
    client.once('ready', async() => {
        const user = await client.users.fetch('494600941325254677');
        user.send(et + ":test");
    });

}

module.exports = { testmessage };