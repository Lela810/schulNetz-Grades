const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
    userID: {
        type: String,
        required: true,
        unique: true,
        index: true
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