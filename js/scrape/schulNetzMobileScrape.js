const cheerio = require('cheerio');
const axios = require('axios');


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


module.exports = { scrapeSchulNetzMobile }