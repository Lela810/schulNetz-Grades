const Discord = require("discord.js");
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { loadUserNoGrades } = require('./db.js');
const fs = require('node:fs');


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

    console.log('Discord is ready!');

    let rest
    if (process.env.PROD == 'true') { rest = new REST({ version: '9' }).setToken(process.env.BOT_TOKEN); } else { rest = new REST({ version: '9' }).setToken(process.env.DEV_TOKEN); }

    const clientId = client.user.id;
    const guildId = '818249756043509771';


    (async() => {
        try {
            if (process.env.PROD == 'true') {
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
        await interaction.deferReply({
            ephemeral: true
        });
        await command.execute(interaction);
    } catch (error) {
        console.error(error);

        await interaction.editReply({
            content: 'An error occurred while executing this command. Please try again later :) \n' + error,
            ephemeral: true
        })

    }
})


async function sendUserDM(userID, message) {
    const user = await client.users.fetch(userID);
    user.send(message);
}


async function sendUserEmbedGradeNotification(userID, messageObject) {

    const embed = new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setTitle(messageObject.name)
        .setURL('https://gibz.zg.ch/login/sls/auth?cmd=auth-t')
        .setAuthor({ name: 'schulNetz Grades', iconURL: client.user.avatarURL() })
        .setThumbnail(client.user.avatarURL())
        .addFields({ name: 'Subject', value: messageObject.subject, inline: true }, { name: 'Grade', value: messageObject.grades + "\u200b", inline: true }, { name: 'Date', value: messageObject.date })
        .setTimestamp()
        .setFooter({ text: 'subject to change', iconURL: client.user.avatarURL() });

    const user = await client.users.fetch(userID);
    user.send({ embeds: [embed] });
}


async function sendUserEmbedCredentialsNotification(userID) {


    const embed = new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setTitle('Your Credentials seem to be wrong!')
        .setURL('https://gibz.zg.ch/login/sls/auth?cmd=auth-t')
        .setAuthor({ name: 'schulNetz Grades', iconURL: client.user.avatarURL() })
        .setThumbnail(client.user.avatarURL())
        .setDescription('Please check your Credentials!')
        .addFields({ name: 'Command', value: '``/edit``', inline: true })
        .setTimestamp()
        .setFooter({ text: 'subject to change', iconURL: client.user.avatarURL() });


    const dbUser = loadUserNoGrades(userID)

    const user = await client.users.fetch(userID);

    let lastMessage
    await (await user.createDM() || await user.dmChannel).messages.fetch({ limit: 1 }).then(messages => {
        lastMessage = messages.first();
    })

    if (lastMessage.embeds[0].title == 'Your Credentials seem to be wrong!' && lastMessage.embeds[0].timestamp >= Date.now() - 86400000 && dbUser.lastSuccessfulScrape >= Date.now() - 3600000) {
        return 0
    } else {
        user.send({ embeds: [embed] });
    }
}


//client.login(process.env.BOT_TOKEN);




module.exports = { client, sendUserDM, sendUserEmbedGradeNotification, sendUserEmbedCredentialsNotification };