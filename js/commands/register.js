const { SlashCommandBuilder } = require('@discordjs/builders');
const { createUser, loadUserNoGrades, findAndUpdate } = require('../db.js');
const { checkCredentials } = require('../check-credentials.js');



module.exports = {
    data: new SlashCommandBuilder()
        .setName('register')
        .setDescription('Register yourself for EDU Grade Notifications!')
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
            .setRequired(false)),
    async execute(interaction) {



        let url
        let pin
        let mail
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
                content: 'You are already registered! \nWe have reactivated your Discord subscription.',
                ephemeral: true
            });
            return
        } catch (err) {}



        try {
            url = interaction.options._hoistedOptions.find(element => element.name === 'url').value;
            pin = interaction.options._hoistedOptions.find(element => element.name === 'pin').value;
            if (await checkCredentials(url, 'url', userID, urlOrPinReverse = pin)) { throw new Error("Incorrect URL!") }
            if (await checkCredentials(pin, 'pin', userID, urlOrPinReverse = url)) { throw new Error("Incorrect Pin!") }
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