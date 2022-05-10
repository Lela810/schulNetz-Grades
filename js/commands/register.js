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


        try {
            const existingUser = await loadUserNoGrades(userID)
            if (!existingUser.subscribeDiscord) {
                await findAndUpdate(userID, true, 'subscribeDiscord')
            }
            interaction.editReply({
                content: 'You are already registered!',
                ephemeral: true
            });
            return
        } catch (err) {}


        switch (interaction.options._subcommand) {
            case 'schulnetzmobile':
                userEntry = await registerSchulNetzMobile(interaction, userID)
                break;
            case 'schulnetz':
                userEntry = await registerSchulNetz(interaction, userID)
                break;
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
};