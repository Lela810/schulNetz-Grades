const Discord = require("discord.js");
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const fs = require('node:fs');
require('dotenv').config()

const client = new Discord.Client({ intents: ["GUILDS", "GUILD_MESSAGES"] });



const commands = [];
const commandFiles = fs.readdirSync("./js/commands").filter(file => file.endsWith('.js'));
client.commands = new Discord.Collection();

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    commands.push(command.data.toJSON());
    client.commands.set(command.data.name, command);
}


client.once('ready', () => {

    console.log('Ready!');

    const rest = new REST({ version: '9' }).setToken(process.env.BOT_TOKEN);
    const clientId = client.user.id;
    const guildId = '818249756043509771';


    (async() => {
        try {
            if (process.env.PROD === 'true') {
                await rest.put(Routes.applicationCommands(clientId), {
                    body: commands
                });
                console.log('Successfully registered commands globally!');
            } else {
                await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
                    body: commands
                });
                console.log('Successfully registered commands in this guild!');
            }
        } catch (error) {
            console.error(error);
        }
    })();

});


client.on("interactionCreate", async interaction => {
    if (!interaction.isCommand()) return;
    const command = client.commands.get(interaction.commandName);
    if (!command) return;
    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);

        await interaction.reply({
            content: 'An error occurred while executing this command. Please try again later :)',
            ephemeral: true
        })
    }
})


client.login(process.env.BOT_TOKEN);




module.exports = {};