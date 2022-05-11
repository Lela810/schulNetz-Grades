const { checkCredentialsUrlPin } = require('../../check-credentials.js');

async function registerSchulNetzMobile(interaction, userID) {


    let url
    let pin
    let mail
    let userEntry

    const validateEmail = (email) => {
        return String(email)
            .toLowerCase()
            .match(
                /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/
            );
    };

    try {
        url = interaction.options._hoistedOptions.find(element => element.name === 'url').value;
        pin = interaction.options._hoistedOptions.find(element => element.name === 'pin').value;
        if (await checkCredentialsUrlPin(url, 'url', userID, pin)) { throw new Error("Incorrect URL!") }
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

    return userEntry

}

module.exports = { registerSchulNetzMobile }