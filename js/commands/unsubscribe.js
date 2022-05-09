const { SlashCommandBuilder } = require('@discordjs/builders');
const { findAndUpdate, loadUserNoGrades } = require('../db.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unsubscribe')
        .setDescription('Disable the awesome schulNetz Grade notifications!'),
    async execute(interaction) {


        let userID
        if (interaction.user.id) {
            userID = interaction.user.id
        } else {
            userID = interaction.member.user.id
        }

        const user = await loadUserNoGrades(userID)
        if (!user) {
            interaction.editReply({
                content: 'Please use ``/register`` first!',
                ephemeral: true
            });
            return
        }


        if (!user.unsubscribe) {

            try {
                await findAndUpdate(userID, true, 'unsubscribe')
            } catch (err) { throw new Error("Could not unsubscribe!") }


            interaction.editReply({
                content: 'You have been unsubscribed from the schulNetz Grade notifications!',
                ephemeral: true
            });
        } else if (user.unsubscribe) {
            interaction.editReply({
                content: 'You are already unsubscribed from the schulNetz Grade notifications!',
                ephemeral: true
            });
        } else { throw new Error("We could not determine your subscription status!") }
    }
};