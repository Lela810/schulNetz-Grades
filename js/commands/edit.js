const { SlashCommandBuilder } = require('@discordjs/builders');
const { findAndUpdate, loadUserNoGrades } = require('../db.js');
const { checkCredentialsUrlPin, checkCredentials } = require('../check-credentials.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('edit')
        .setDescription('Edit either your Link or Pin!')
        .addStringOption(option =>
            option.setName('url')
            .setDescription('New schulNetz.mobile Link')
            .setRequired(false))
        .addIntegerOption(option =>
            option.setName('pin')
            .setDescription('New schulNetz.mobile Pin')
            .setRequired(false))
        .addStringOption(option =>
            option.setName('mail')
            .setDescription('New Notification Mail-Address')
            .setRequired(false))
        .addStringOption(option =>
            option.setName('username')
            .setDescription('New schulNetz Username')
            .setRequired(false))
        .addStringOption(option =>
            option.setName('password')
            .setDescription('New schulNetz Password')
            .setRequired(false))
        .addStringOption(option =>
            option.setName('otp')
            .setDescription('New schulNetz OTP Key')
            .setRequired(false)),
    async execute(interaction) {


        let changeCounter = 0
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


        const validateEmail = (email) => {
            return String(email)
                .toLowerCase()
                .match(
                    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/
                );
        };



        try {

            if (interaction.options._hoistedOptions.find(element => element.name == 'url') != undefined) {
                changeCounter++
                const url = interaction.options._hoistedOptions.find(element => element.name === 'url').value;
                if (await checkCredentialsUrlPin(url, 'url', userID, interaction)) { throw new Error("Invalid URL") }
                await findAndUpdate(userID, url, 'url')
            }
            if (interaction.options._hoistedOptions.find(element => element.name == 'pin') != undefined) {
                changeCounter++
                const pin = interaction.options._hoistedOptions.find(element => element.name === 'pin').value;
                if (await checkCredentialsUrlPin(pin, 'pin', userID, interaction)) { throw new Error("Invalid PIN") }
                await findAndUpdate(userID, pin, 'pin')
            }
            if (interaction.options._hoistedOptions.find(element => element.name == 'mail') != undefined) {
                changeCounter++
                const mail = interaction.options._hoistedOptions.find(element => element.name == 'mail').value;
                if (validateEmail(mail) == null) { throw new Error("Invalid Mail") }
                await findAndUpdate(userID, mail, 'mail')
            }


            let username
            let password
            let otp
            if (interaction.options._hoistedOptions.find(element => element.name == 'username') != undefined) {
                changeCounter++
                username = interaction.options._hoistedOptions.find(element => element.name == 'username').value;
            }
            if (interaction.options._hoistedOptions.find(element => element.name == 'password') != undefined) {
                changeCounter++
                password = interaction.options._hoistedOptions.find(element => element.name == 'password').value;
            }
            if (interaction.options._hoistedOptions.find(element => element.name == 'otp') != undefined) {
                changeCounter++
                otp = interaction.options._hoistedOptions.find(element => element.name == 'otp').value;
            }


            if (username && password && otp) {
                console.log(await checkCredentials(userID, interaction, username, password, otp))
                if (await checkCredentials(userID, interaction, username, password, otp)) { return }
                await findAndUpdate(userID, username, 'username')
                await findAndUpdate(userID, password, 'password')
                await findAndUpdate(userID, otp, 'otp')
            } else if (username || password || otp) {
                let key = []
                if (!username) {
                    username = user.username;
                    key += 'username'
                }
                if (!password) {
                    password = user.password;
                    key += 'password'
                }
                if (!otp) {
                    otp = user.otp;
                    key += 'otp'
                }
                if (await checkCredentials(userID, interaction, username, password, otp)) {
                    return
                }
                switch (true) {
                    case (!key.includes('username')):
                        await findAndUpdate(userID, username, 'username')
                        break
                    case (!key.includes('password')):
                        await findAndUpdate(userID, password, 'password')
                        break
                    case (!key.includes('otp')):
                        await findAndUpdate(userID, otp, 'otp')
                        break
                }

            }
            if (changeCounter <= 0) { throw new Error("No Changes given") } else {
                interaction.editReply({
                    content: 'Your schulNetz.mobile infos have been saved!',
                    ephemeral: true
                });
                return
            }
        } catch (err) {
            console.log(err);
            interaction.editReply({
                content: 'Please be sure that you have entered a **valid** option!',
                ephemeral: true
            });
        }

    }
};