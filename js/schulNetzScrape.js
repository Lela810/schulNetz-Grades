const cheerio = require('cheerio');
const request = require('request');

function scrape(url, pin) {

    const options = {
        method: 'POST',
        url: url,
        formData: {
            "pin": pin,
        }
    };

    request(options, (error, response, html) => {
        if (!error) {
            let gradesDataArray = new Array()
            const $ = cheerio.load(html);
            gradesDataArray = $(`body > table:first-of-type`)
                .text()
                .trim()
                .replace(/\s\s+/g, '\n')
                .split('\n')


            /* for (var i = 0; i < gradesDataArray.length; i++) {
                console.log(gradesDataArray[i])
            } */


            //console.log(gradesDataArray[0] + gradesDataArray[1] + gradesDataArray[2])

            return gradesDataArray;


        } else {
            throw new Error(error);
        }
    })
};

module.exports = { scrape }