const { SlashCommandBuilder } = require('@discordjs/builders');
const { createUser } = require('../db.js');



module.exports = {
    data: new SlashCommandBuilder()
        .setName('register')
        .setDescription('Register yourself for EDU Grade Notifications!')
        .addStringOption(option =>
            option.setName('link')
            .setDescription('schulNetz.mobile Link')
            .setRequired(true))
        .addIntegerOption(option =>
            option.setName('pin')
            .setDescription('schulNetz.mobile Pin')
            .setRequired(true)),
    async execute(interaction) {



        let url
        let pin

        try {
            url = interaction.options._hoistedOptions.find(element => element.name === 'link').value;
            pin = interaction.options._hoistedOptions.find(element => element.name === 'pin').value;
        } catch (err) {
            interaction.editReply({
                content: 'Please enter a valid schulNetz.mobile Link and Pin!',
                ephemeral: true
            });
            return;
        }


        const user = {
            ['userID']: interaction.member.user.id,
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