const functions = require('firebase-functions');

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const port = process.env.PORT || 5000;
const mongoose = require('mongoose');
const dishRouter = express.Router();
const multer = require('multer');
const path = require('path');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const flash = require('connect-flash');
const session = require('express-session');
const bcrypt = require('bcryptjs');
var nodemailer = require('nodemailer');



// IMPORTING MODEL
const Dish = require('./../model/dish.model');
const Blog = require('./../model/blog.model');
const User = require('./../model/user.model');
const Story = require('./../model/story.model');
const Shopping = require('./../model/shopping.model');

app.use(cors());
app.use(bodyParser.json());


mongoose.connect('mongodb+srv://indrakant:Vishal@123@cookitabhicluster.ppui1.mongodb.net/cookitabhi?retryWrites=true&w=majority', { useNewUrlParser: true });
const connection = mongoose.connection;

connection.once('open', ()=> {
    console.log('MongoDB is connected');
}); 


// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
exports.helloWorld = functions.https.onRequest((request, response) => {

    response.send('Hi')
    // Dish.find((err, dishes)=> {
    //     if(err){
    //         console.log(err);
    //     }else{
    //         response.json(dishes);
    //     }
    // });
});



exports.app = functions.https.onRequest(app);