const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
    userID: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    subscribeDiscord: {
        type: Boolean,
        required: false
    },
    subscribeMail: {
        type: Boolean,
        required: false
    },
    url: {
        type: String,
        required: false
    },
    pin: {
        type: Number,
        required: false
    },
    username: {
        type: String,
        required: false
    },
    password: {
        type: String,
        required: false
    },
    otp: {
        type: String,
        required: false
    },
    mail: {
        type: String,
        required: false
    },
    grades: {
        type: Object,
        required: false
    }
})

module.exports = mongoose.model('user', userSchema)