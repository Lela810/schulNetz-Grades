const mongoose = require("mongoose")

const archiveSchema = new mongoose.Schema({
    date: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    menu: {
        type: Object,
        required: false
    },
    error: {
        type: String,
        required: false
    }
})

module.exports = mongoose.model('Archive', archiveSchema)