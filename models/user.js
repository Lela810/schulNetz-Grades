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
        required: true
    },
    pin: {
        type: Number,
        required: true
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