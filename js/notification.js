const { loadAllUsers, findAndUpdate } = require('./db.js');
const { scrapeSchulNetz } = require('./scrape/schulNetzScrape.js');
const { scrapeSchulNetzMobile } = require('./scrape/schulNetzMobileScrape.js');
const { sendUserEmbedGradeNotification } = require('./discord.js');
const { sendNotificationMail } = require('./mail.js');


async function notify() {

    const users = await loadAllUsers();
    //console.log(users)

    for (userID in users) {

        let currentUser = users[userID]
        let newGrades = 1


        try {
            if (currentUser.url && currentUser.pin) {
                newGrades = await scrapeSchulNetzMobile(currentUser.userID, currentUser.url, currentUser.pin)
            } else if (currentUser.username && currentUser.password && currentUser.otp && newGrades == 0 | 1) {
                newGrades = await scrapeSchulNetz(currentUser.userID, currentUser.username, currentUser.password, currentUser.otp)
            }
            if (newGrades == 1 | null) { throw new Error("Could not scrape new grades") }
        } catch (err) {
            continue
        }


        let failedCheck
        await newGrades.forEach(element => {
            if (Object.values(element).includes(NaN)) { failedCheck = true }
        })
        if (failedCheck) { continue }


        if (!currentUser.grades) {

            currentUser.grades = newGrades
            await findAndUpdate(currentUser.userID, currentUser.grades, 'grades')

        } else {

            const isSameGrade = (a, b) => a.subject === b.subject && a.name === b.name;

            const onlyInLeft = (left, right, compareFunction) =>
                left.filter(leftValue =>
                    !right.some(rightValue =>
                        compareFunction(leftValue, rightValue)));

            const difference = onlyInLeft(newGrades, currentUser.grades, isSameGrade);

            currentUser.grades.push(...difference)

            await findAndUpdate(currentUser.userID, Date.now(), 'lastSuccessfulScrape')

            if (difference.length > 0) {
                await findAndUpdate(currentUser.userID, currentUser.grades, 'grades')

                for (i in difference) {

                    if (currentUser.subscribeDiscord) {
                        await sendUserEmbedGradeNotification(currentUser.userID, difference[i])
                    }
                    if (currentUser.subscribeMail && currentUser.mail) {
                        sendNotificationMail(currentUser.mail, "A New Grade has been uploaded!", difference[i])
                    }
                }
            }
        }

    }

}


module.exports = { notify }