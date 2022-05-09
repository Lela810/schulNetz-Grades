const { SlashCommandBuilder } = require('@discordjs/builders');
const { createUser } = require('../db.js');
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
            .setRequired(true)),
    async execute(interaction) {



        let url
        let pin


        let userID
        if (interaction.user.id) {
            userID = interaction.user.id
        } else {
            userID = interaction.member.user.id
        }



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





        const user = {
            ['userID']: userID,
            ['url']: url,
            ['pin']: pin
        }


        try {

            await createUser(user)
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