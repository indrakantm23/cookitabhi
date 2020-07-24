const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let Dish = new Schema({
    dish: {
        type: String
    },
    cookingTime: {
        type: Object
    },
    difficulty: {
        type: String
    },
    ingredients: {
        type: Array
    },
    keyIngredients: {
        type: String
    },
    methods: {
        type: Array
    },
    recepeDescription: {
        type: String
    },
    serving: {
        type: String
    },
    category: {
        type: String
    },
    file: {
        type: String
    },
    videos: []
});

module.exports = mongoose.model('Dish', Dish);