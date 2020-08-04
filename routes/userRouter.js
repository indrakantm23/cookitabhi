const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');
const bcrypt = require('bcryptjs');
const User = require('./../model/user.model');

const mailer = require('./../mailer/sendMail');

const userRouter = express.Router();
userRouter.use(bodyParser.json());

// GET ALL USERS
userRouter.route('/').get((req, res)=> {
    User.find((err, users) => {
        if(err){
            res.send(err);
        }
        else{
            res.json(users)
        }
    })
});


userRouter.route('/:id').get(function(req, res){
    User.findById(req.params.id, function(err, user) {
        if(err) res.json(err)
        else
        res.json({user});
    });
});


// Get shops neerby user
userRouter.route('/near').get((req, res)=> {
    User.find((err, resp)=> {
        if(err){
            console.log(err);
        }else{
            // res.json(resp);
            let arr = [];
            for(let i=0; i<resp.length; i++){
                if(resp[i].selectedLandmark != null){
                    arr.push(resp[i]);
                }
            }
            res.json({arr})
        }
    });
});


// ADD PRODUCT INTO CART
userRouter.route('/add/product/:id').post((req, res) => {
    let data = req.body.data;
    User.findById(req.params.id, (err, user) => {
        user.shoppingCart.push(data);
        user.save();
        res.json({shoppingCart: data});
    });
});



// Add quantity of product
userRouter.route('/add/quantity/:id').post((req, res) => {
    let id = req.body.id;
    User.findById(req.params.id, (err, user) => {
        user.shoppingCart = req.body.arr;
        user.save();
        res.json({shoppingCart: user.shoppingCart});
    });
});


// Reduce quantity of product
userRouter.route('/reduce/quantity/:id').post((req, res) => {
    let id = req.body.id;
    User.findById(req.params.id, (err, user) => {
        user.shoppingCart = req.body.arr;
        user.save();
        res.json({shoppingCart: user.shoppingCart});
    });
});


// Get user added products
userRouter.route('/get/product/:id').get((req, res) =>{
    User.findById(req.params.id, (err, user) => {
        res.json({shoppingCart: user.shoppingCart});
    });
});


// Get users
userRouter.route('/users/:id').get((req, res) => {
    let myId = req.params.id;
    User.find((err, users) => {
        if(err){
            console.log(err);
        }
        else{
            User.findById(req.params.id, (err, user) => {
                let arr = user.following || [];
                let data = users.filter(a => { return arr.indexOf(a._id) === -1 && a._id.toString() !== myId.toString()});
                data = data.map(a => { return {id: a._id, name:a.name, img: a.avatar} });
                res.json({data});
                
            })
        }
    });
});


// GET A USER
userRouter.route('/user/:id').get((req, res)=> {
    let id = req.params.id;
    User.findById(id, (err, data)=> {
        if(err){
            res.json(err);
        }else{
            let user = [];
            user.push({name: data.name, avatar: data.avatar, business_type: data.business_type, chef: data.chef, email: data.email, followers: data.followers.length, following: data.following.length, runs_business: data.runs_business});
            res.json(user)
        }
    });
});


// Get user checkout details
userRouter.route('/checkout/:id').get((req, res) => {
    User.findById(req.params.id, (err, user) => {
        if(err){ res.json(err) }
        else { res.json({addresses: user.addresses, delivery_address: user.delivery_address}) }
    });
});


// Follow a user
userRouter.route('/follow-user/:id').post(function(req, res){
    let followId = req.body.followId;
    var uId = req.params.id;
    User.findById(req.params.id, function(err, user){
        if(err){
             res.json(err)
        }
        else {
            user.following && user.following.push(followId);
            user.save();
            User.findById(followId, function(err, userData){
                userData.followers.push(uId)
                userData.save();
            })
            res.json({following: user.following})
        };
    });
});


// Push notifications
userRouter.route('/notify/:id').post((req, res) => {
    User.findById(req.params.id, (err, user) => {
        if(err){
            res.json(err)
        }
        else{
            if(user !== null){
                user.notifications.push(req.body.data);
                user.save();
                res.json({status: 200, data_pushed: true})
            }else{
                res.json({err: 'User is null'})
            }
        }
    });
});



// Get notifications
userRouter.route('/get-notifications/:id').get((req, res) => {
    User.findById(req.params.id, (err, user) => {
        if(err){
            res.json(err);
        }else{
            res.json(user.notifications);
        }
    });
});


// Get following list
userRouter.route('/following/:id').get(function(req, res) {
    User.findById(req.params.id, function(err, user){
        if(err) {
            res.json(err);
        }
        else{
            var arr = user.following || [];
            var arr2 = user.followers || [];
            var following=[];
            var followers = [];


            for(var i=0; i<arr.length; i++){
                    User.findById(arr[i], (err, followingList) => {
                        if(followingList !== null){
                            following.push({id: followingList._id, name: followingList.name, img: followingList.avatar});
                        }
                })                        
            }

            for(var i=0; i<arr2.length; i++){
                User.findById(arr2[i], (err, followerList) => {
                    if(followerList !== null) 
                    followers.push({id: followerList._id, name: followerList.name, img: followerList.avatar});    
                })
            }
            setTimeout(() => {
                res.json({following, followers})
            }, 1000)
        }
    });
});



// Get user's liked blogs
userRouter.get('/liked-blogs/:id', (req, res) => {
    User.findById(req.params.id, function(err, user){
        if(err) res.json({err : 'Something went wrong'})
        else
        res.json({liked_blogs: user.liked_blogs ?  user.liked_blogs : [], following: user.following ? user.following : []})
    });  
  });
  


// CHECK EMAIL
userRouter.route('/check-email/:email').get((req, res) => {
    User.findOne({ email: req.params.email }).then(user => {
        if(user) {
            res.json({msg: `User already exist with ${req.params.email}`, userExist: true })
        }else{
            res.json({msg: `${req.params.email} is available`, userExist: false})
        }
    });
});


// CHECK USERNAME
userRouter.route('/check-username/:username').get((req, res) => {
    User.findOne({ username: req.params.username }).then(user => {
        if(user) {
            res.json({msg: `User already exist with ${req.params.username}`, userExist: true })
        }else{
            res.json({msg: `${req.params.username} is available`, userExist: false})
        }
    });
});


// Login
userRouter.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, userData, info) => {
        if(err){ return next(err) }
        if(!userData){
            // console.log(info);
           return res.json({info, loggedIn: false})
        }
        console.log('Logged in');
        let user = userData;
        delete user.password;
        return res.status(200).json({user: {id: user._id, name: user.name, email: user.email, photo: user.avatar, loggedIn: true || ""}, loggedIn: true});
    })(req, res, next);
});



// Register
userRouter.route('/register').post((req, res) => {
    let email = req.body.email;
    User.findOne({email, email}).then(user => {
        if(user){
            res.status(400).json({user: 'User already exist'});
        }else{
            let user = new User(req.body);
            bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(user.password, salt, (err, hash) => {
                    if(err) throw err;
                    user.password = hash;
                    user.save()
                    .then(user => {
                        res.status(200).json({user: 'User created successfully'});
                        mailer.sendOnboardingMail(user.name, user.email)
                        
                    })
                    .catch(err => {
                        res.status(400).send('Failed creating user');
                    });
                });
            });
        }
    });
});


// Set new password
userRouter.route('/change-password').post((req, res) => {
    User.findOne({email: req.body.email}).then(user => {
        if(user){
            bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(req.body.password, salt, (err, hash) => {
                    if(err) throw err;
                    user.password = hash;
                    user.save()
                    .then(user => {
                        res.status(200).json({msg: 'Password updated successfully'});
                    })
                    .catch(err => {
                        res.status(400).send('Failed updating password');
                    });
                });
            });
        }
    });
});





module.exports = userRouter;