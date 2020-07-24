const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let Products = new Schema({
    product: {
        type: String
    },
    img: {
        type: String
    },
    qty: {
        type: String
    },
    price: {
        type: String
    },
    category: {
        type: String
    }
});

module.exports = mongoose.model('Products', Products);