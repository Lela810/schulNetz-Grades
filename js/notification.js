const { loadAllUsers, findAndUpdate } = require('./db.js');
const { scrape } = require('./schulNetzScrape.js');
const { sendUserEmbedNotification } = require('./discord.js');


async function notify() {

    const users = await loadAllUsers()
        //console.log(users)

    for (userID in users) {

        let currentUser = users[userID]

        const newGrades = await scrape(currentUser.url, currentUser.pin)

        if (newGrades == null) {
            continue
        }


        if (!currentUser.grades) {
            currentUser.grades = newGrades
            await findAndUpdate(currentUser.userID, currentUser.grades, 'grades')
        }

        if (!currentUser.url || !currentUser.pin) {
            return
        }


        const isSameGrade = (a, b) => a.subject === b.subject && a.name === b.name;

        const onlyInLeft = (left, right, compareFunction) =>
            left.filter(leftValue =>
                !right.some(rightValue =>
                    compareFunction(leftValue, rightValue)));

        const difference = onlyInLeft(newGrades, currentUser.grades, isSameGrade);

        //console.log(difference);

        currentUser.grades.push(...difference)

        if (difference.length > 0) {
            await findAndUpdate(currentUser.userID, currentUser.grades, 'grades')
            await sendUserEmbedNotification(currentUser.userID, currentUser.url, difference[0])
        }

    }

}

module.exports = { notify }