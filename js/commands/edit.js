const { SlashCommandBuilder } = require('@discordjs/builders');
const { findAndUpdate, loadUserNoGrades } = require('../db.js');
const { checkCredentialsUrlPin } = require('../check-credentials.js');

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
            .setRequired(false)),
    async execute(interaction) {


        let url
        let pin
        let mail
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

        function sendAnswer(interaction) {
            interaction.editReply({
                content: 'Your schulNetz.mobile infos have been saved!',
                ephemeral: true
            });
            return
        }




        try {

            switch (true) {
                case (interaction.options._hoistedOptions.find(element => element.name == 'url') != undefined):
                    {
                        url = interaction.options._hoistedOptions.find(element => element.name === 'url').value;
                        if (await checkCredentialsUrlPin(url, 'url', userID, interaction)) { throw new Error("Invalid URL") }
                        await findAndUpdate(userID, url, 'url')
                        await sendAnswer(interaction)
                        return
                    }
                case (interaction.options._hoistedOptions.find(element => element.name == 'pin') != undefined):
                    {
                        pin = interaction.options._hoistedOptions.find(element => element.name === 'pin').value;
                        if (await checkCredentialsUrlPin(pin, 'pin', userID, interaction)) { throw new Error("Invalid PIN") }
                        await findAndUpdate(userID, pin, 'pin')
                        sendAnswer(interaction)
                        return
                    }
                case (interaction.options._hoistedOptions.find(element => element.name == 'mail') != undefined):
                    {
                        mail = interaction.options._hoistedOptions.find(element => element.name == 'mail').value;
                        if (validateEmail(mail) == null) { throw new Error("Invalid Mail") }
                        await findAndUpdate(userID, mail, 'mail')
                        sendAnswer(interaction)
                        return
                    }
                default:
                    {
                        interaction.editReply({
                            content: 'Please be sure that you have entered a **valid** option!',
                            ephemeral: true
                        });
                    }


            }

        } catch (err) {
            interaction.editReply({
                content: 'Please be sure that you have entered a **valid** option!',
                ephemeral: true
            });
        }

    }
};