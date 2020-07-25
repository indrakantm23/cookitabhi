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

require('./Authentication/passport')(passport);

// IMPORTING MODEL
const Dish = require('./model/dish.model');
const Blog = require('./model/blog.model');
const User = require('./model/user.model');
const Story = require('./model/story.model');
const Shopping = require('./model/shopping.model');

app.use(cors());
app.use(bodyParser.json());

// mongodb+srv://indrakant:Vishal@123@cookitabhicluster.ppui1.mongodb.net/cookitabhi?retryWrites=true&w=majority

// mongodb://127.0.0.1:27017/cookitabhi
// process.env.MONGODB_URI || 
mongoose.connect('mongodb+srv://indrakant:Vishal@123@cookitabhicluster.ppui1.mongodb.net/cookitabhi?retryWrites=true&w=majority', { useNewUrlParser: true });
const connection = mongoose.connection;

connection.once('open', ()=> {
    console.log('MongoDB is connected');
}); 


// For Production
// if(process.env.NODE_ENV === 'production'){
//     app.use(express.static('build'));
    
//     app.get('*', (req, res) => {
//         res.sendFile(path.resolve(__dirname, 'build', 'index.html'));        
//     })
// }


// Express Session
// app.use(session({
//     secret: 'secret',
//     resave: false,
//     saveUninitialized: true
// }));

// Passport Middleware
// app.use(passport.initialize());
// app.use(passport.session());

// Connect flash
// app.use(flash());

// Global vars
// app.use((req, res, next) => {
//     res.locals.success_msg = req.flash('success_msg');
//     res.locals.error_msg = req.flash('error_msg');
//     next();
// })


const storage = multer.diskStorage({
    destination: './public/upload',
    filename: function(req, file, cb){
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

// initialize upload
const upload = multer({
    storage: storage
}).single('cook-it-abhi');

// function checkFileType(file, cb){
//     // allowed ext
//     const filetypes = /jpeg|jpg|png|gif/;
//     // check ext
//     const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
//     // check mime
//     const mimetype = filetypes.test(file.mimetype);

//     if(mimetype && extname){
//         return cb(null, true);
//     }else {
//         cb('Error: Images Only');
//     }
// }
dishRouter.route('/').get((req, res)=> {
    Dish.find((err, dishes)=> {
        if(err){
            console.log(err);
        }else{
            res.json(dishes);
        }
    });
});


// Send reset password mail
// app.post('/reset-pass', (req, res) => {
//     User.findOne({email: req.body.email}, (err, user) => {
//         if(user){
//             var transporter = nodemailer.createTransport({
//                 service: 'gmail',
//                 auth: {
//                   user: 'mevishal23@gmail.com',
//                   pass: 'kusumavishal'
//                 }
//               });
              
//                 const person = {
//                     id: user._id,
//                     username: user.name,
//                     email: user.email
//                 }
//                 jwt.sign({user: person}, 'secretkey', (err, token) => {
//                     var mailOptions = {
//                         from: '"Cook it abhi" <mevishal23@gmail.com>',
//                         to: req.body.email,
//                         subject: 'Password reset',
//                         html: `Hi ${user.name}, <br/><br/>You can reset your password using <b><a href='http://localhost:3000/reset-password?${token}'>password reset link</a></b>.<br/><br/>Thanks,<br/>Cookitabhi`,
                        
//                         };
                  
//                     transporter.sendMail(mailOptions, function(error, info){
//                         if (error) {
//                           console.log(error);
//                         } else {
//                           console.log('Email sent: ' + info.response);
//                           res.json({status: 200, msg: `Email sent to ${req.body.email}`, token})
//                         }
//                       });
//                 })


//         }
//         else {
//             res.json({status: 404, msg: 'Incorrect email ID'})
//         }
//     })
// })

// // Get shops neerby user
dishRouter.route('/near').get((req, res)=> {
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

// Search dish
dishRouter.route('/search/:search_key').get((req, res) => {
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


// // Search product
dishRouter.route('/search/product/:search_key').get((req, res) => {
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



// // ADD PRODUCT INTO CART
// dishRouter.route('/add/product/:id').post((req, res) => {
//     let data = req.body.data;
//     User.findById(req.params.id, (err, user) => {
//         user.shoppingCart.push(data);
//         user.save();
//         res.json({shoppingCart: data});
//     });
// });


// // Add quantity of product
// dishRouter.route('/add/quantity/:id').post((req, res) => {
//     let id = req.body.id;
//     User.findById(req.params.id, (err, user) => {
//         user.shoppingCart = req.body.arr;
//         user.save();
//         res.json({shoppingCart: user.shoppingCart});
//     });
// });

// // Reduce quantity of product
// dishRouter.route('/reduce/quantity/:id').post((req, res) => {
//     let id = req.body.id;
//     User.findById(req.params.id, (err, user) => {
//         user.shoppingCart = req.body.arr;
//         user.save();
//         res.json({shoppingCart: user.shoppingCart});
//     });
// });

// // Get user added products
// dishRouter.route('/get/product/:id').get((req, res) =>{
//     User.findById(req.params.id, (err, user) => {
//         res.json({shoppingCart: user.shoppingCart});
//     })
// })

// Get users
dishRouter.route('/users/:id').get((req, res) => {
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

// // Get stories
// dishRouter.route('/stories/:id').get((req, res) => {
//     let id = req.params.id;
//     var arr = [];
//     Story.find((err, stories) => {
//         if(err){
//             console.log(err);
//         }
//         else{
//             User.findById(id, (err, user) => {
//                 let following = user && user.following && user.following.length ? user.following : [];
                
//                 for(var i=0; i<stories.length; i++){
//                     if(following.indexOf(stories[i].user.id) !== -1 || following.indexOf(id) !== -1){
//                         arr.push(stories[i])
//                     }
//                 }
//             })
//             // res.json({arr});
//             setTimeout(()=> {
//                 res.json({arr})
//             }, 100)
//         }
//     });
// });

// // Delete a story
// dishRouter.route('/delete-story/:id').get((req, res)=>{
//     let id = req.params.id.toString();
//     let query = {_id: id};
//     Story.remove(query, (err, story)=>{
//         if(err){
//             console.log(err);
//         }else{
//             res.status(200).json({msg: 'story deleted'})
//         }
//     });
// });


// // Get blogs
dishRouter.route('/blogs').get((req, res) => {
    Blog.find((err, blogs) => {
        if(err){
            console.log(err);
        }else{
            res.json(blogs.slice(0).reverse());
        }
    });
});

// // Get products
dishRouter.route('/products').get((req, res) => {
    Shopping.find((err, products) => {
        if(err) {
            console.log(err);
        }
        else{
            res.json({products});
        }
    })
})


// // Get blogs of user
// dishRouter.route('/blogs/:id').get((req, res) => {
//     Blog.find((err, blogs) => {
//         if(err){
//             console.log(err);
//         }else{
//             // res.json(blogs.slice(0).reverse());
//             // let arr = blogs.filter((a => { return a.user_id.toString() === req.params.id.toString()}))
//             let arr = blogs.filter((a => { return a.user_id && a.user_id!== null && a.user_id.toString() === req.params.id.toString()}))
//             // arr = arr.map((a => { return a.user_id }))
//             res.json({blogs: arr, blog_count: arr.length})

//         }
//     });
// });

// // GET A DISH
// dishRouter.route('/:id').get((req, res)=> {
//     let id = req.params.id;
//     Dish.findById(id, (err, dish)=> {
//         res.json(dish);
//     });
// });

// GET A Product
// dishRouter.route('/item/:id').get((req, res)=> {
//     let id = req.params.id;
//     Shopping.findById(id, (err, item)=> {
//         res.json(item);
//     });
// });

// dishRouter.route('/blog/:id').get((req, res)=> {
//     let id = req.params.id;
//     Blog.findById(id, (err, blog)=> {
//         res.json(blog);
//     });
// });

// dishRouter.route('/blogs/:id').post(function(req, res){
//     let uid = req.body.id;
//     let blogId = req.params.id;
//     let likeData = {}; let likeBlogs = [];
//     Blog.findById(req.params.id, function(err, blog){
//         if(!blog)
//             res.status(404).send('Blog not found');
//         else
//             blog.total_likes = blog.total_likes+1;
//             blog.liked = true

//             blog.save().then(blog => {
//                 // res.json({total_likes: blog.total_likes})
//                 likeData.total_likes = blog.total_likes;
//                 User.findById(uid, (err, user)=> {
//                     user.liked_blogs.push(blogId);
                    
//                     user.save();
//                     likeBlogs = user.liked_blogs;
//                     res.json({likeData, likeBlogs})
//                 })
//                 // res.json({likeData, likeBlogs})
//             })
//             // .then(res => 
//             //     User.findById(uid, (err, user)=> {
//             //         user.liked_blogs.push(blogId);
//             //         user.save();
//             //         console.log(user);
//             //     })
//             //     )
//             .catch(err => {
//                 res.status(400).send('Count not like');
//             });
//     });
// });

// // Follow a user
// dishRouter.route('/user/:id').post(function(req, res){
//     let followId = req.body.followId;
//     var uId = req.params.id;
//     User.findById(req.params.id, function(err, user){
//         if(err){
//              res.json(err)
//         }
//         else {
//             user.following && user.following.push(followId);
//             user.save();
//             User.findById(followId, function(err, userData){
//                 userData.followers.push(uId)
//                 userData.save();
//             })
//             res.json({following: user.following})
//         };
//     });
// });

// Post a comment
// dishRouter.route('/addComment/:id').post(function(req, res){
//     Blog.findById(req.params.id, (err, blog) => {
//         if(err) {
//             res.json({ err });
//         }else{
//             blog.comments.push(req.body);
//             blog.save();
//             res.json({comments: blog.comments})
//         }
//     });
// });

// // Get blog comments
// dishRouter.route('/getComment/:id').get(function(req, res){
//     Blog.findById(req.params.id, (err, blog) => {
//         if(err) {
//             res.json({ err });
//         }else{
//             res.json({comments: blog.comments})
//         }
//     });
// });


// // Delete a comment
// dishRouter.route('/delete-comment/:id').post((req, res)=>{
//     let i = req.body.i;
//     Blog.findById(req.params.id, (err, blog) => {
//         if(err){
//             res.json({err});
//         }else{
//             blog.comments.splice(i, 1);
//             blog.save();
//             res.json({comments: blog.comments});
//         }
//     })
// })



// dishRouter.route('/user/:id').get(function(req, res){
//     User.findById(req.params.id, function(err, user) {
//         if(err) res.json(err)
//         else
//         res.json({user});
//     });
// });

// // Get following list
// dishRouter.route('/following/:id').get(function(req, res) {
    
//     User.findById(req.params.id, function(err, user){
//         if(err) {
//             res.json(err);
//         }
//         else{
//             var arr = user.following || [];
//             var arr2 = user.followers || [];
//             var following=[];
//             var followers = [];


//             for(var i=0; i<arr.length; i++){
//                     User.findById(arr[i], (err, followingList) => {
//                         if(followingList !== null){
//                             following.push({id: followingList._id, name: followingList.name, img: followingList.avatar});
//                         }
//                 })                        
//             }

//             for(var i=0; i<arr2.length; i++){
//                 User.findById(arr2[i], (err, followerList) => {
//                     if(followerList !== null) 
//                     followers.push({id: followerList._id, name: followerList.name, img: followerList.avatar});    
//                 })
//             }
//             setTimeout(() => {
//                 res.json({following, followers})
//             }, 1000)
//         }
//     });
// });



// // Get user's liked blogs
// dishRouter.get('/liked-blogs/:id', (req, res) => {
//   User.findById(req.params.id, function(err, user){
//       if(err) res.json({err : 'Something went wrong'})
//       else
//       res.json({liked_blogs: user.liked_blogs, following: user.following})
//     // console.log(user)
//   });  
// });






    // Pushing into user array
    // User.findById(uid, function(err, user){
    //     user.liked_blogs.push("5edb7ff49819033abcdd182e");
    //     user.save(done);
    // });


// app.use(express.static('./public'));

// app.post('/upload', (req, res)=> {
//     upload(req, res, (err) => {
//         if(err){
//             res.json({
//                 msg: err,
//             });
//         }else {
//             res.json({
//                 msg: 'File uploaded',
//                 file: `upload/${req.file.filename}`
//             });
//         }
//     })
// });


// dishRouter.route('/insert').post((req, res)=> {
//     let dish = new Dish(req.body);
//     dish.save()
//         .then(dish => {
//             res.status(200).json({dish: 'dish added successfully'});
//         })
//         .catch(err => {
//             res.status(400).send('adding dish failed');
//         });
// });


// // Post Story
// dishRouter.route('/post-story').post((req, res) => {
//     let story = new Story(req.body);
//     story.save().then(story => {
//         res.status(200).json({msg: 'Story posted successfully', story});
//     })
//     .catch(err => {
//         res.status(400).send('Failed posting story');
//     });
// });


// // Register
// dishRouter.route('/register').post((req, res) => {
//     let email = req.body.email;
//     User.findOne({email, email}).then(user => {
//         if(user){
//             res.status(400).json({user: 'User already exist'});
//         }else{
//             let user = new User(req.body);
//             bcrypt.genSalt(10, (err, salt) => {
//                 bcrypt.hash(user.password, salt, (err, hash) => {
//                     if(err) throw err;
//                     user.password = hash;
//                     user.save()
//                     .then(user => {
//                         res.status(200).json({user: 'User created successfully'});
//                     })
//                     .catch(err => {
//                         res.status(400).send('Failed creating user');
//                     });
//                 })
//             })
//         }
//     })
// });


// // Set new password
// dishRouter.route('/change-password').post((req, res) => {
//     User.findOne({email: req.body.email}).then(user => {
//         if(user){
//             bcrypt.genSalt(10, (err, salt) => {
//                 bcrypt.hash(req.body.password, salt, (err, hash) => {
//                     if(err) throw err;
//                     user.password = hash;
//                     user.save()
//                     .then(user => {
//                         res.status(200).json({msg: 'Password updated successfully'});
//                     })
//                     .catch(err => {
//                         res.status(400).send('Failed updating password');
//                     });
//                 })
//             })
//         }
//     })
// })

// // Login
// dishRouter.post('/login', (req, res, next) => {
//     passport.authenticate('local', (err, userData, info) => {
//         if(err){ return next(err) }
//         if(!userData){
//             // console.log(info);
//            return res.json({info, loggedIn: false})
//         }
//         console.log('Logged in');
//         let user = userData;
//         delete user.password;
//         return res.status(200).json({user: {id: user._id, name: user.name, email: user.email, photo: user.avatar, loggedIn: true || ""}, loggedIn: true});
//     })(req, res, next);
// });



// // Logout
// dishRouter.get('/logout', (req, res) => {
//     req.logout();
//     res.json({message: 'You are logged out'});
// });

// dishRouter.route('/post-blog').post((req, res)=> {
//     let blog = new Blog(req.body);
//     blog.save()
//         .then(blog => {
//             res.status(200).json({blog: 'Blog posted successfully', data: blog});
//         })
//         .catch(err => {
//             res.status(400).send('adding blog failed');
//         });
// });



// app.post('/login', (req, res) => {
//     const user = {
//         id: 1,
//         username: 'indrakant',
//         email: 'indrakant@gmail.com'
//     }
//     jwt.sign({user}, 'secretkey', (err, token) => {
//         res.json({
//             token
//         });
//     })
// })

// dishRouter.route('/').get(verifyToken, (req, res)=> {
//     jwt.verify(req.token, 'secretkey', (err, authData)=> {
//         if(err){
//             res.sendStatus(403);
//         }else{
//             Dish.find((err, dishes)=> {
//                 if(err){
//                     console.log(err);
//                 }else{
//                     res.json(dishes);
//                 }
//             });
//         }
//     });
// });

// function verifyToken(req, res, next){
//     const bearerHeader = req.headers['authorised'];
//     if(typeof bearerHeader !== 'undefined'){
//         const bearer = bearerHeader.split(' ');
//         const bearerToken = bearer[1];
//         req.token = bearerToken;

//         next();
//     }else {
//         res.sendStatus(403);
//     }
// }

// dishRouter.route('/add').post((req, res)=> {
//     let dish = new Dish(req.body);
//     dish.save()
//     .then(dish => {
//         res.status(200).json({'dish': 'Dish added successfully'});
//     })
//     .catch(err => {
//         res.status(400).send('Adding dish failed');
//     });
// });  

app.use('/dishes', dishRouter);

// INSERT FAKE USERS

// app.get('/', (req, res) => {
//       for(let i=0; i<users.length; i++){
//         let user = new User(users[i]);
//         bcrypt.genSalt(10, (err, salt) => {
//             bcrypt.hash(user.password, salt, (err, hash) => {
//                 if(err) throw err;
//                 user.password = hash;
//                 user.save()
//                 .then(user => {
//                     res.status(200).json({user: 'User created successfully'});
//                 })
//                 .catch(err => {
//                     res.status(400).send('Failed creating user');
//                 });
//             })
//         })
//       }
// })




// INSERT SCRAPE IMAGE
app.get('/', (req, res) => {

console.log('Hello in console, Indrakant');
        res.send("Hello i'm here");
})

// if(process.env.NODE_ENV === 'production') {
//     app.use(express.static('../client/build'));
// }

app.listen(port, () => console.log(`Server is listening at http://localhost:${port}`))
