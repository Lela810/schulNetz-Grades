const cheerio = require('cheerio');
const axios = require('axios');
const puppeteer = require('puppeteer');
const { authenticator } = require('otplib');


async function scrapeSchulNetzMobile(url, pin) {

    let $
    try {

        const { data } = await axios.post(url, `pin=${pin}`, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });
        $ = cheerio.load(data);

    } catch (err) {
        return null;
    }



    const check = $('h3:contains("Ihre letzten Noten")').text();
    if (check != 'Ihre letzten Noten') {
        return null;
    }


    const gradesDataArray = $(`body > table:first-of-type`)
        .text()
        .trim()
        .replace(/\s\s+/g, '\n')
        .split('\n')


    const gradesData = [];
    for (let i = 0; i < gradesDataArray.length / 4; i++) {
        const items = gradesDataArray.slice(i * 4, i * 4 + 4);

        gradesData.push({
            subject: items[0],
            name: items[1],
            date: items[2],
            grades: parseFloat(items[3]),
        });
    }


    /* for (var i = 0; i < gradesDataArray.length; i++) {
        console.log(gradesDataArray[i])
    } */

    //console.log(gradesDataArray)

    return gradesData;

};




async function scrapeSchulNetz(username, password, otp) {



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

    await page.waitForSelector('input[name="challenge"]');

    await page.type('input[name="challenge"]', token);
    await page.click('button[type="submit"]');

    await page.waitForSelector('body');

    const $ = cheerio.load(await page.evaluate(() => document.querySelector('*').outerHTML));

    await browser.close();



    const check = $('h3:contains("Ihre letzten Noten")').text();
    if (check != 'Ihre letzten Noten') {
        return null;
    }


    const gradesDataArray = $(`main div div div:contains("Ihre letzten Noten") + table tbody`)
        .text()
        .trim()
        .replace(/\s\s+/g, '\n')
        .split('\n')



    const gradesData = [];
    for (let i = 0; i < gradesDataArray.length / 4; i++) {
        const items = gradesDataArray.slice(i * 4, i * 4 + 4);

        gradesData.push({
            subject: items[0],
            name: items[1],
            date: items[2],
            grades: parseFloat(items[3]),
        });
    }


    return gradesData;


};

module.exports = { scrapeSchulNetzMobile, scrapeSchulNetz }