const { SlashCommandBuilder } = require('@discordjs/builders');
const { findAndUpdate } = require('../db.js');
const { checkCredentials } = require('../check-credentials.js');

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
            .setRequired(false)),
    async execute(interaction) {


        let url
        let pin
        let userID
        const keys = ['url', 'pin']


        if (interaction.user.id) {
            userID = interaction.user.id
        } else {
            userID = interaction.member.user.id
        }




        try {
            for (key in keys) {
                const keyStr = keys[key]
                try {
                    const value = interaction.options._hoistedOptions.find(element => element.name === keyStr).value;
                    if ([keyStr] == 'url') { url = value } else if ([keyStr] == 'pin') { pin = value }
                    if (await checkCredentials(value, [keyStr], userID, interaction)) { return }
                    await findAndUpdate(userID, value, [keyStr])
                } catch (err) {}
            }

            if (!pin && !url) {
                interaction.editReply({
                    content: 'Please enter a valid schulNetz.mobile Link or Pin!',
                    ephemeral: true
                });
            } else {
                interaction.editReply({
                    content: 'Your schulNetz.mobile infos have been saved!',
                    ephemeral: true
                });
            }

        } catch (err) {
            console.error(err);
            throw new Error("Something went wrong during the database entry update!");
        }

    }
};