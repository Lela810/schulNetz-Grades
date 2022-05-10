const { SlashCommandBuilder } = require('@discordjs/builders');
const { checkCredentials } = require('../check-credentials.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Pong!'),
    async execute(interaction) {

        interaction.editReply({
            content: 'Pong!',
            ephemeral: true
        });
    }
};