const cheerio = require('cheerio');
const axios = require('axios');
const { loadUserNoGrades } = require('./db.js');

async function checkCredentials(urlOrPin, key, userID, interaction) {


    let pin
    let url

    const user = (await loadUserNoGrades(userID))[0]


    if (key == 'url') {
        url = urlOrPin
        pin = user.pin
    } else if (key == 'pin') {
        pin = urlOrPin
        url = user.url
    }


    let $
    try {

        const { data } = await axios.post(url, `pin=${pin}`, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });
        $ = cheerio.load(data);

    } catch (err) {
        try {
            interaction.editReply({
                content: "This Link does not appear to work!",
                ephemeral: true
            });
        } catch (err) {}
        return 1;
    }



    const check = $('h3:contains("Ihre letzten Noten")').text();
    if (check != 'Ihre letzten Noten') {
        try {
            interaction.editReply({
                content: "This Pin does not seem to let us in!",
                ephemeral: true
            });
        } catch (err) {}
        return 1;
    }

    return 0
}

module.exports = { checkCredentials }