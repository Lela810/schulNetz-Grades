const cheerio = require('cheerio');
const axios = require('axios');
const { loadUserNoGrades } = require('./db.js');

async function checkCredentials(urlOrPin, key, userID, urlOrPinReverse, interaction) {

    let pin
    let url

    const user = await loadUserNoGrades(userID)


    if (key == 'url') {
        url = urlOrPin
        try { pin = user.pin } catch (err) { pin = urlOrPinReverse }
    } else if (key == 'pin') {
        pin = urlOrPin
        try { url = user.url } catch (err) { url = urlOrPinReverse }
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