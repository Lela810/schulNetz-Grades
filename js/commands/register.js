const { SlashCommandBuilder } = require('@discordjs/builders');
const { createUser, loadUserNoGrades, findAndUpdate } = require('../db.js');
const { checkCredentialsUrlPin } = require('../check-credentials.js');



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



        let url
        let pin
        let mail
        let username
        let password
        let otp
        let userEntry


        let userID
        if (interaction.user.id) {
            userID = interaction.user.id
        } else {
            userID = interaction.member.user.id
        }


        const validateEmail = (email) => {
            return String(email)
                .toLowerCase()
                .match(
                    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/
                );
        };



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



        if (interaction.options._hoistedOptions.find(element => element.name === 'url') || interaction.options._hoistedOptions.find(element => element.name === 'pin')) {
            try {
                url = interaction.options._hoistedOptions.find(element => element.name === 'url').value;
                pin = interaction.options._hoistedOptions.find(element => element.name === 'pin').value;
                if (await checkCredentialsUrlPin(url, 'url', userID, urlOrPinReverse = pin)) { throw new Error("Incorrect URL!") }
                if (await checkCredentialsUrlPin(pin, 'pin', userID, urlOrPinReverse = url)) { throw new Error("Incorrect Pin!") }
            } catch (err) {
                console.log(err);
                interaction.editReply({
                    content: 'Please enter a **valid and working** schulNetz.mobile Link and Pin!',
                    ephemeral: true
                });
                return;
            }


            if (interaction.options._hoistedOptions.find(element => element.name == 'mail') != undefined) {
                mail = interaction.options._hoistedOptions.find(element => element.name == 'mail').value
                if (validateEmail(mail) == null) {
                    interaction.editReply({
                        content: 'Please enter a **valid** Email-Address!',
                        ephemeral: true
                    });
                    return
                }
                userEntry = {
                    ['userID']: userID,
                    ['url']: url,
                    ['pin']: pin,
                    ['mail']: mail,
                    ['subscribeDiscord']: true
                }
            } else {
                userEntry = {
                    ['userID']: userID,
                    ['url']: url,
                    ['pin']: pin,
                    ['subscribeDiscord']: true
                }
            }
        } else if (interaction.options._hoistedOptions.find(element => element.name === 'username') || interaction.options._hoistedOptions.find(element => element.name === 'password')) {
            try {
                username = interaction.options._hoistedOptions.find(element => element.name === 'username').value;
                password = interaction.options._hoistedOptions.find(element => element.name === 'password').value;
                otp = interaction.options._hoistedOptions.find(element => element.name === 'otp').value;
                /* if (await checkCredentials(url, 'url', userID, urlOrPinReverse = pin)) { throw new Error("Incorrect URL!") }
                if (await checkCredentials(pin, 'pin', userID, urlOrPinReverse = url)) { throw new Error("Incorrect Pin!") } */
            } catch (err) {
                console.log(err);
                interaction.editReply({
                    content: 'Please enter a **valid and working** schulNetz username, password and OTP!',
                    ephemeral: true
                });
                return;
            }

            userEntry = {
                ['userID']: userID,
                ['username']: username,
                ['password']: password,
                ['otp']: otp,
                ['subscribeDiscord']: true
            }

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