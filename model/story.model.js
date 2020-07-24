const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let Story = new Schema({
    user: {
        type: Object
    },
    story_img: {
        type: String
    },
    story_caption: {
        type: String
    },
    date: {
        type: String
    }
});

module.exports = mongoose.model('Story', Story);