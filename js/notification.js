const { loadAllUsers, findAndUpdate } = require('./db.js');
const { scrapeSchulNetz } = require('./scrape/schulNetzScrape.js');
const { scrapeSchulNetzMobile } = require('./scrape/schulNetzMobileScrape.js');
const { sendUserEmbedNotification } = require('./discord.js');
const { sendNotificationMail } = require('./mail.js');


async function notify() {

    const users = await loadAllUsers();
    //console.log(users)

    for (userID in users) {

        let currentUser = users[userID]
        let newGrades

        if (currentUser.url && currentUser.pin) {
            newGrades = await scrapeSchulNetzMobile(currentUser.url, currentUser.pin)
        } else if (currentUser.username && currentUser.password && currentUser.otp) {
            newGrades = await scrapeSchulNetz(currentUser.username, currentUser.password, currentUser.otp)
        }

        if (newGrades == null) {
            continue
        }


        if (!currentUser.grades) {
            currentUser.grades = newGrades
            await findAndUpdate(currentUser.userID, currentUser.grades, 'grades')
        }

        /* if (!currentUser.url || !currentUser.pin) {
            return
        } */


        const isSameGrade = (a, b) => a.subject === b.subject && a.name === b.name;

        const onlyInLeft = (left, right, compareFunction) =>
            left.filter(leftValue =>
                !right.some(rightValue =>
                    compareFunction(leftValue, rightValue)));

        const difference = onlyInLeft(newGrades, currentUser.grades, isSameGrade);

        //console.log(currentUser.mail);

        currentUser.grades.push(...difference)

        if (difference.length > 0) {
            await findAndUpdate(currentUser.userID, currentUser.grades, 'grades')
            for (i in difference) {
                console.log()
                if (currentUser.subscribeDiscord) {
                    await sendUserEmbedNotification(currentUser.userID, difference[i])
                }
                if (currentUser.subscribeMail && currentUser.mail) {
                    sendNotificationMail(currentUser.mail, "A New Grade has been uploaded!", difference[i])
                }
            }
        }


    }

}


module.exports = { notify }