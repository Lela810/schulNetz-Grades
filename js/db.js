const user = require('../models/user.js');


async function createUser(json) {

    const userEntry = new user(json)

    try {
        await userEntry.save()
    } catch (err) {
        throw err;
    }
}


async function findAndUpdate(userID, newKeyValue, key) {

    user.findOneAndUpdate({ 'userID': userID }, {
        $set: {
            [key]: newKeyValue
        }
    }, function(err, result) {
        if (err) {
            console.error(err);
        } else {
            return result
        }
    });

}


async function loadUserNoGrades(userID) {
    let userEntry
    try {
        userEntry = await user.find({ 'userID': userID }, { _id: 0, __v: 0, grades: 0 });
        return userEntry[0]
    } catch (err) {
        console.error(err);
        return err;
    }
}


async function loadUser(userID) {
    let userEntry
    try {
        userEntry = await user.find({ 'userID': userID }, { _id: 0, __v: 0 });
        return userEntry[0]
    } catch (err) {
        console.error(err);
        return err;
    }
}


async function loadAllUsers(find) {
    let users
    if (!find) { find = {} }
    try {
        users = await user.find(find, { _id: 0, __v: 0 });
        return users
    } catch (err) {
        console.error(err);
        return err;
    }
}


module.exports = { createUser, loadAllUsers, findAndUpdate, loadUserNoGrades, loadUser }