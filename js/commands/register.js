const { SlashCommandBuilder } = require('@discordjs/builders');



module.exports = {
    data: new SlashCommandBuilder()
        .setName('register')
        .setDescription('Register yourself for EDU Grade Notifications!')
        .addStringOption(option =>
            option.setName('link')
            .setDescription('schulNetz.mobile Link')
            .setRequired(false))
        .addIntegerOption(option =>
            option.setName('pin')
            .setDescription('schulNetz.mobile Pin')
            .setRequired(false)),
    async execute(interaction) {

        await interaction.deferReply({
            ephemeral: true
        });

        const url = interaction.options._hoistedOptions.find(element => element.name === 'link').value;
        const pin = interaction.options._hoistedOptions.find(element => element.name === 'pin').value;




        interaction.editReply({
            content: 'Your are now registered for schulNetz Grade Notifications!',
            ephemeral: true
        });


    }
};