const { checkCredentials } = require('../../check-credentials.js');

async function registerSchulNetz(interaction, userID) {


    let otp
    let password
    let username
    let userEntry

    try {
        username = interaction.options._hoistedOptions.find(element => element.name === 'username').value;
        password = interaction.options._hoistedOptions.find(element => element.name === 'password').value;
        otp = interaction.options._hoistedOptions.find(element => element.name === 'otp').value;
        if (await checkCredentials(userID, interaction, username, password, otp)) { throw new Error("Incorrect Credentials!") }
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

    return userEntry

}

module.exports = { registerSchulNetz }