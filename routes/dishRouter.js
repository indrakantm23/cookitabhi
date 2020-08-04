const express = require('express');
const bodyParser = require('body-parser');
const Dish = require('./../model/dish.model');

const dishRouting = express.Router();
dishRouting.use(bodyParser.json());

// GET ALL DISHES
dishRouting.route('/').get((req, res)=> {
    const page = parseInt(req.query.skip_page)
    let data = Dish.find().limit(10).skip(page * 10)
    data.exec((err, dishes) => {
        if(err){
            res.json(err);
        }else{
            res.json(dishes);
        }
    });
});


// Search dish
dishRouting.route('/search/:search_key').get((req, res) => {
    let key = new RegExp(req.params.search_key, 'i');
    Dish.find((err, dishes) => {
        if(err){
            console.log(err);
        }else{
            let arr = dishes.filter(a => {return a.dish.match(key)});
            let data = arr.map(a => { return {id: a._id, dish: a.dish} })
            res.json({data});
        }
    });
});


// GET A DISH
dishRouting.route('/:id').get((req, res)=> {
    let id = req.params.id;
    Dish.findById(id, (err, dish)=> {
        res.json(dish);
    });
});


// INSERT DISH INTO DB
dishRouting.route('/insert').post((req, res)=> {
    let dish = new Dish(req.body);
    dish.save()
        .then(dish => {
            res.status(200).json({dish: 'dish added successfully'});
        })
        .catch(err => {
            res.status(400).send('adding dish failed');
        });
});




module.exports = dishRouting;