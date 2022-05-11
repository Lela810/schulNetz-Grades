const cheerio = require('cheerio');
const axios = require('axios');
const { loadUserNoGrades } = require('./db.js');
const puppeteer = require('puppeteer');
const { authenticator } = require('otplib');

async function checkCredentialsUrlPin(urlOrPin, key, userID, urlOrPinReverse, interaction) {

    let pin
    let url

    const user = await loadUserNoGrades(userID)


    if (key == 'url') {
        url = urlOrPin
        pin = user.pin
        if (pin == undefined) {
            pin = urlOrPinReverse
        }
    } else if (key == 'pin') {
        pin = urlOrPin
        url = user.url
        if (url == undefined) {
            url = urlOrPinReverse
        }
    }


    if (url == false || pin == false) {
        try {
            interaction.editReply({
                content: "Some login credentials are missing!",
                ephemeral: true
            });
        } catch (err) {}
        return 1;
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


async function checkCredentials(userID, interaction, username = false, password = false, otp = false) {


    const user = await loadUserNoGrades(userID)


    const inputs = [username, password, otp]


    try {
        for (i in inputs) {
            const input = inputs[i]

            if (!input) {
                switch (i) {
                    case '0':
                        username = user.username
                        break;
                    case '1':
                        password = user.password
                        break;
                    case '2':
                        otp = user.otp
                        break;
                }
            }
        }
        if (username == undefined || password == undefined || otp == undefined) { throw new Error("Not all Inputs are given") }
    } catch (err) {
        try {
            interaction.editReply({
                content: "Your login credentials are missing!",
                ephemeral: true
            });
        } catch (err) {}
        return 1;
    }


    const TIMEDOUT = Symbol('TIMEDOUT');
    async function cReject(ms) {
        return new Promise((_, reject) => setTimeout(reject, ms, TIMEDOUT));
    }



    try {

        const url = "https://gibz.zg.ch/login/sls/auth?cmd=auth-t"
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox']
        })
        const page = await browser.newPage();
        await page.goto(url);
        await page.type('input[name="userid"]', username);
        await page.type('input[name="password"]', password);
        await page.click('button[type="submit"]');

        const token = authenticator.generate(otp);

        try {
            await page.waitForSelector('input[name="challenge"]', { timeout: 1000 });
        } catch (err) {
            try {
                interaction.editReply({
                    content: "Your Username/Password seem to be wrong!",
                    ephemeral: true
                });
            } catch (err) {}
            return 1;
        }

        await page.type('input[name="challenge"]', token);
        await page.click('button[type="submit"]');

        try {
            await page.waitForSelector('table tbody', { timeout: 1000 });
        } catch (err) {
            console.log(err);
            try {
                interaction.editReply({
                    content: "Your OTP Key seems to be wrong!",
                    ephemeral: true
                });
            } catch (err) {}
            return 1;
        }

        await browser.close();

    } catch (err) {
        try {
            interaction.editReply({
                content: "Your login credentials seem to be wrong!",
                ephemeral: true
            });
        } catch (err) {}
        return 1;
    }

    return 0;


}

module.exports = { checkCredentialsUrlPin, checkCredentials }