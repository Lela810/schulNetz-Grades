const { SlashCommandBuilder } = require('@discordjs/builders');
const { findAndUpdate, loadUserNoGrades } = require('../db.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('edit')
        .setDescription('Edit either your Link or Pin!')
        .addStringOption(option =>
            option.setName('link')
            .setDescription('New schulNetz.mobile Link')
            .setRequired(false))
        .addIntegerOption(option =>
            option.setName('pin')
            .setDescription('New schulNetz.mobile Pin')
            .setRequired(false)),
    async execute(interaction) {


        let url
        let pin
        let userID


        if (interaction.user.id) {
            userID = interaction.user.id
        } else {
            userID = interaction.member.user.id
        }




        try {
            url = interaction.options._hoistedOptions.find(element => element.name === 'link').value;
            let user = (await loadUserNoGrades(userID))[0]
            user.url = url
            console.log(await findAndUpdate(userID, user.url, 'url'))
        } catch (err) {}


        try {
            pin = interaction.options._hoistedOptions.find(element => element.name === 'pin').value;
            let user = (await loadUserNoGrades(userID))[0]
            user.pin = pin
            console.log(await findAndUpdate(userID, user.pin, 'pin'))
        } catch (err) {}


        if (url === undefined && pin === undefined) {
            interaction.editReply({
                content: 'Please enter a valid schulNetz.mobile Link or Pin!',
                ephemeral: true
            });
            return;
        }


    }
};