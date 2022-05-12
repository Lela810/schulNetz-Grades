const { SlashCommandBuilder } = require('@discordjs/builders');
const { createUser, loadUserNoGrades, findAndUpdate } = require('../db.js');
const { registerSchulNetzMobile } = require('./register/schulnetzmobile.js');
const { registerSchulNetz } = require('./register/schulnetz.js');



module.exports = {
    data: new SlashCommandBuilder()
        .setName('register')
        .setDescription('Register yourself for EDU Grade Notifications!')
        .addSubcommand(subcommand =>
            subcommand
            .setName('schulnetzmobile')
            .setDescription('Use schulNetz.mobile to register!')
            .addStringOption(option =>
                option.setName('url')
                .setDescription('schulNetz.mobile Link')
                .setRequired(true))
            .addIntegerOption(option =>
                option.setName('pin')
                .setDescription('schulNetz.mobile Pin')
                .setRequired(true))
            .addStringOption(option =>
                option.setName('mail')
                .setDescription('Mail-Address to receive Notifications')
                .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
            .setName('schulnetz')
            .setDescription('Register with username, password and OTP!')
            .addStringOption(option =>
                option.setName('username')
                .setDescription('schulNetz Username')
                .setRequired(true))
            .addStringOption(option =>
                option.setName('password')
                .setDescription('schulNetz Password')
                .setRequired(true))
            .addStringOption(option =>
                option.setName('otp')
                .setDescription('Your schulNetz OTP Key! (Not the one which is generated)')
                .setRequired(true))),


    async execute(interaction) {


        let userEntry


        let userID
        if (interaction.user.id) {
            userID = interaction.user.id
        } else {
            userID = interaction.member.user.id
        }



        const existingUser = await loadUserNoGrades(userID)

        if (existingUser != undefined) {



            if (!existingUser.subscribeDiscord && !existingUser.subscribeMail) {
                interaction.followUp({
                    content: 'You can subscribe to Notifications using ``/subscribe``!',
                    ephemeral: true
                })
            };

            if (existingUser.username && existingUser.password && existingUser.otp) {
                if (interaction.options._subcommand == 'schulnetz') {
                    interaction.followUp({
                        content: 'You are already registered using schulNetz Credentials! \nTry using ``/register schulnetzmobile`` instead!',
                        ephemeral: true
                    })
                    return
                } else {
                    userEntry = await registerSchulNetzMobile(interaction, userID)
                    await findAndUpdate(existingUser.userID, userEntry.url, 'url')
                    await findAndUpdate(existingUser.userID, userEntry.pin, 'pin')
                    interaction.followUp({
                        content: 'Your are now registered using schulNetz.mobile!',
                        ephemeral: true
                    })
                    return
                }
            }
            if (existingUser.url && existingUser.pin) {
                if (interaction.options._subcommand == 'schulnetzmobile') {
                    interaction.followUp({
                        content: 'You are already registered using schulNetz.Mobile Credentials! \nTry using ``/register schulnetz`` instead!',
                        ephemeral: true
                    })
                    return
                } else {
                    userEntry = await registerSchulNetz(interaction, userID)
                    await findAndUpdate(existingUser.userID, userEntry.username, 'username')
                    await findAndUpdate(existingUser.userID, userEntry.password, 'password')
                    await findAndUpdate(existingUser.userID, userEntry.otp, 'otp')
                    interaction.followUp({
                        content: 'Your are now registered using schulNetz Credentials!',
                        ephemeral: true
                    })
                    return
                }
            }

            await interaction.editReply({
                content: 'You are already registered!',
                ephemeral: true
            });

        } else {

            switch (interaction.options._subcommand) {
                case 'schulnetzmobile':
                    userEntry = await registerSchulNetzMobile(interaction, userID)
                    break;
                case 'schulnetz':
                    userEntry = await registerSchulNetz(interaction, userID)
                    break;
            }
            if (userEntry == 1) {
                return
            }



            try {

                await createUser(userEntry)
                interaction.editReply({
                    content: 'Your are now registered for schulNetz Grade Notifications!',
                    ephemeral: true
                });

            } catch (err) {

                if (err.code == 11000) {
                    interaction.editReply({
                        content: 'Your are already registered for schulNetz Grade Notifications!',
                        ephemeral: true
                    });
                    return
                } else {
                    console.log(err);
                    throw new Error("Could not create user!");
                }

            }
        }

    }
};