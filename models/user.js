const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
    userID: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    unsubscribe: {
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
    grades: {
        type: Object,
        required: false
    }
})

module.exports = mongoose.model('user', userSchema)