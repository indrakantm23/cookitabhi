const express = require('express');
const bodyParser = require('body-parser');
const Shopping = require('./../model/shopping.model');

const productRouter = express.Router();
productRouter.use(bodyParser.json());

// Get products
productRouter.route('/').get((req, res) => {
    Shopping.find((err, products) => {
        if(err) {
            console.log(err);
        }
        else{
            res.json({products});
        }
    });
});

// Search products
productRouter.route('/search/product/:search_key').get((req, res) => {
    let key = new RegExp(req.params.search_key, 'i');
    Shopping.find((err, product) => {
        if(err){
            console.log(err);
        }else{
            let arr = product.filter(a => {return a.product.match(key)});
            let data = arr.map(a => { return {id: a._id, product: a.product} })
            res.json({data});
        }
    });
});


// GET A Product
productRouter.route('/item/:id').get((req, res)=> {
    let id = req.params.id;
    Shopping.findById(id, (err, item)=> {
        res.json(item);
    });
});





module.exports = productRouter;