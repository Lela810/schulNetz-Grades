const { SlashCommandBuilder } = require('@discordjs/builders');
const { findAndUpdate, loadUserNoGrades } = require('../db.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unsubscribe')
        .setDescription('Disable the awesome schulNetz Grade notifications!')
        .addStringOption(option =>
            option.setName('notifications')
            .setDescription('What kind of notifications do you want unsubscribe?')
            .setRequired(true)
            .addChoices({ name: 'Discord', value: 'discord' }, { name: 'Mail', value: 'mail' })
        ),
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


        const userChoice = interaction.options._hoistedOptions.find(element => element.name === 'notifications').value;


        if (user.subscribeDiscord && userChoice === 'discord') {

            try {
                await findAndUpdate(userID, false, 'subscribeDiscord')
            } catch (err) { throw new Error("Could not unsubscribe!") }


            interaction.editReply({
                content: 'You have been unsubscribed from the schulNetz Grade Discord notifications!',
                ephemeral: true
            });
        } else if (!user.subscribeDiscord && userChoice === 'discord') {
            interaction.editReply({
                content: 'You are already unsubscribed from the schulNetz Grade Discord notifications!',
                ephemeral: true
            });
        } else if (userChoice === 'discord') { throw new Error("We could not determine your subscription status!") }


        if (user.subscribeMail && userChoice === 'mail') {

            try {
                await findAndUpdate(userID, false, 'subscribeMail')
            } catch (err) { throw new Error("Could not unsubscribe!") }


            interaction.editReply({
                content: 'You have been unsubscribed from the schulNetz Grade Mail notifications!',
                ephemeral: true
            });
        } else if (!user.subscribeMail && userChoice === 'mail') {
            interaction.editReply({
                content: 'You are already unsubscribed from the schulNetz Grade Mail notifications!',
                ephemeral: true
            });
        } else if (userChoice === 'mail') { throw new Error("We could not determine your subscription status!") }

    }
};