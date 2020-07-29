const mongoose = require('mongoose');
const User = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    chef: {
        type: Boolean,
    },
    liked_blogs: {
        type: Array
    },
    story: {
        type: Array
    },
    avatar: {
        type: String
    },
    business_type: {
        type: String
    },
    runs_business: {
        type: String
    },
    selectedLandmark: {
        type: Object
    },
    full_address: {
        type: String
    },
    home_delivery: {
        type: String
    },
    phone: {
        type: Number
    },
    followers: {
        type: Array
    },
    following: {
        type: Array
    },
    shopBanner: {
        type: String
    },
    shoppingCart: {
        type: Array
    },
    notifications: {
        type: Array
    }
});

module.exports = mongoose.model('User', User);