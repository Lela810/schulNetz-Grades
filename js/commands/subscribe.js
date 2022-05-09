const { SlashCommandBuilder } = require('@discordjs/builders');
const { findAndUpdate, loadUserNoGrades } = require('../db.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('subscribe')
        .setDescription('Subscribe to schulNetz Notification! **(Requires previous registration)**')
        .addStringOption(option =>
            option.setName('notifications')
            .setDescription('What kind of notifications do you want to receive?')
            .setRequired(true)
            .addChoices({ name: 'Discord', value: 'discord' }, { name: 'Mail', value: 'mail' })
        )
        .addStringOption(option =>
            option.setName('mail')
            .setDescription('Your preferred Mail-Address to receive Notifications!')
            .setRequired(false)
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

        let mail
        try {
            mail = interaction.options._hoistedOptions.find(element => element.name === 'mail').value;
            await findAndUpdate(userID, mail, 'mail')
        } catch (err) {}

        if (!user.mail && userChoice === 'mail' && !mail) {
            interaction.editReply({
                content: 'Please enter a Mail-Address!',
                ephemeral: true
            });
            return
        }


        if (!user.subscribeDiscord && userChoice === 'discord') {

            try {
                await findAndUpdate(userID, true, 'subscribeDiscord')
            } catch (err) { throw new Error("Could not unsubscribe!") }


            interaction.editReply({
                content: 'You have subscribed to schulNetz Grade Discord notifications!',
                ephemeral: true
            });
        } else if (user.subscribeDiscord && userChoice === 'discord') {
            interaction.editReply({
                content: 'You are already subscribed to schulNetz Grade Discord notifications!',
                ephemeral: true
            });
        } else if (userChoice === 'discord') { throw new Error("We could not determine your subscription status!") }


        if (!user.subscribeMail && userChoice === 'mail') {

            try {
                await findAndUpdate(userID, true, 'subscribeMail')
            } catch (err) { throw new Error("Could not unsubscribe!") }


            interaction.editReply({
                content: 'You have subscribed to schulNetz Grade Mail notifications!',
                ephemeral: true
            });
        } else if (user.subscribeMail && userChoice === 'mail') {
            interaction.editReply({
                content: 'You are already subscribed to schulNetz Grade Mail notifications!',
                ephemeral: true
            });
        } else if (userChoice === 'mail') { throw new Error("We could not determine your subscription status!") }

    }
};