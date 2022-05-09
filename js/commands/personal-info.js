const { SlashCommandBuilder } = require('@discordjs/builders');
const { loadUser } = require('../db.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('personal-info')
        .setDescription('See what is stored in your schulNetz.mobile Notification account!'),
    async execute(interaction) {


        let userID
        if (interaction.user.id) {
            userID = interaction.user.id
        } else {
            userID = interaction.member.user.id
        }

        const user = await loadUser(userID)
        if (!user) {
            interaction.editReply({
                content: 'Please use ``/register`` first!',
                ephemeral: true
            });
            return
        }


        interaction.editReply({
            content: '**ALL INFORMATION ABOUT YOU**\n\n``' + JSON.stringify(user, null, 1) + '``',
            ephemeral: true
        });


    }
};