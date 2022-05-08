const user = require('../models/user.js');


async function createUser(json) {

    const userEntry = new user(json)

    try {
        await userEntry.save()
    } catch (err) {
        throw err;
    }
}


async function findAndUpdate(userID, newUser) {

    user.findOneAndUpdate({ 'userID': userID }, {
        $set: { grades: newUser.grades }
    }, function(err, result) {
        if (err) {
            console.error(err);
        } else {
            return result
        }
    });

}


async function loadAllUsers() {
    let users
    try {
        users = await user.find({}, { _id: 0, __v: 0 });
        return users
    } catch (err) {
        console.error(err);
        return err;
    }
}


module.exports = { createUser, loadAllUsers, findAndUpdate }