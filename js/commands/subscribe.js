const { SlashCommandBuilder } = require('@discordjs/builders');
const { findAndUpdate, loadUserNoGrades } = require('../db.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('subscribe')
        .setDescription('Subscribe to schulNetz Notification! **(Requires previous registration)**'),
    async execute(interaction) {


        let userID
        if (interaction.user.id) {
            userID = interaction.user.id
        } else {
            userID = interaction.member.user.id
        }

        const user = (await loadUserNoGrades(userID))[0]

        if (user.unsubscribe) {

            try {
                await findAndUpdate(userID, false, 'unsubscribe')
            } catch (err) { throw new Error("Could not unsubscribe!") }


            interaction.editReply({
                content: 'You have subscribed to schulNetz Grade notifications!',
                ephemeral: true
            });
        } else if (!user.unsubscribe) {
            interaction.editReply({
                content: 'You are already subscribed to schulNetz Grade notifications!',
                ephemeral: true
            });
        } else { throw new Error("We could not determine your subscription status!") }
    }
};