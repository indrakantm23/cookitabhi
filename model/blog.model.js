const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let Blog = new Schema({
    heading: {
        type: String
    },
    description: {
        type: String
    },
    tags: {
        type: Array
    },
    file: {
        type: String
    },
    posted_on: {
        type: String
    },
    total_likes: {
        type: Number
    },
    total_comments: {
        type: Number
    },
    user_name: {
        type: String
    },
    user_id: {
        type: String
    },
    user_image: {
        type: String
    },
    comments: {
        type: Array
    }
});

module.exports = mongoose.model('Blog', Blog);