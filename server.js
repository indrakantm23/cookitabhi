const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const port = process.env.PORT || 4000;
// const mongoose = require('mongoose');
const dishRouter = express.Router();
const multer = require('multer');
const path = require('path');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const flash = require('connect-flash');
const session = require('express-session');
const bcrypt = require('bcryptjs');
var nodemailer = require('nodemailer');

// const io = require('socket.io')
const dishRouting = require('./routes/dishRouter');
const userRouter = require('./routes/userRouter');
const blogRouter = require('./routes/blogRouter');
const productRouter = require('./routes/productRouter');
const storyRouter = require('./routes/storyRouter');

const db = require('./model/db');
// const users = require('./../components/users');
// const products = require('./../components/products');
// const dishData = require('./../components/dishes');

const faker = require('faker');
const download = require('image-downloader');



require('./Authentication/passport')(passport);

// IMPORTING MODEL
const Dish = require('./model/dish.model');
const Blog = require('./model/blog.model');
const User = require('./model/user.model');
const Story = require('./model/story.model');
const Shopping = require('./model/shopping.model');

app.use(cors());
app.use(bodyParser.json());

app.use('/dishes', dishRouting);
app.use('/users', userRouter);
app.use('/blogs', blogRouter);
app.use('/products', productRouter);
app.use('/stories', storyRouter);


// app.use(express.static(path.join(__dirname, 'build')));


// app.get('/*', (req, res) => {
//   res.sendFile(path.join(__dirname, 'build', 'index.html'));
// });

// mongodb+srv://indrakant:Vishal@123@cookitabhicluster.ppui1.mongodb.net/cookitabhi?retryWrites=true&w=majority

// mongodb://127.0.0.1:27017/cookitabhi
// process.env.MONGODB_URI || 


// mongoose.connect('mongodb+srv://indrakant:Vishal@123@cookitabhicluster.ppui1.mongodb.net/cookitabhi?retryWrites=true&w=majority', { useNewUrlParser: true,  useUnifiedTopology: true });
// const connection = mongoose.connection;

// connection.once('open', ()=> {
//     console.log('MongoDB is connected');
// }); 





// Express Session
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: true
}));

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash());

// Global vars
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    next();
})


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

function checkFileType(file, cb){
    // allowed ext
    const filetypes = /jpeg|jpg|png|gif/;
    // check ext
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // check mime
    const mimetype = filetypes.test(file.mimetype);

    if(mimetype && extname){
        return cb(null, true);
    }else {
        cb('Error: Images Only');
    }
}


// Send reset password mail
app.post('/reset-pass', (req, res) => {
    User.findOne({email: req.body.email}, (err, user) => {
        if(user){
            var transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                  user: 'mevishal23@gmail.com',
                  pass: 'kusumavishal'
                }
              });
              
                const person = {
                    id: user._id,
                    username: user.name,
                    email: user.email
                }
                jwt.sign({user: person}, 'secretkey', (err, token) => {
                    var mailOptions = {
                        from: '"Cook it abhi" <mevishal23@gmail.com>',
                        to: req.body.email,
                        subject: 'Password reset',
                        html: `Hi ${user.name}, <br/><br/>You can reset your password using <b><a href='http://localhost:3000/reset-password?${token}'>password reset link</a></b>.<br/><br/>Thanks,<br/>Cookitabhi`,
                        
                        };
                  
                    transporter.sendMail(mailOptions, function(error, info){
                        if (error) {
                          console.log(error);
                        } else {
                          console.log('Email sent: ' + info.response);
                          res.json({status: 200, msg: `Email sent to ${req.body.email}`, token})
                        }
                      });
                })


        }
        else {
            res.json({status: 404, msg: 'Incorrect email ID'})
        }
    });
});



// Get stories
dishRouter.route('/stories/:id').get((req, res) => {
    let id = req.params.id;
    var arr = [];
    Story.find((err, stories) => {
        if(err){
            console.log(err);
        }
        else{
            User.findById(id, (err, user) => {
                let following = user && user.following && user.following.length ? user.following : [];
                
                for(var i=0; i<stories.length; i++){
                    if(following.indexOf(stories[i].user.id) !== -1 || following.indexOf(id) !== -1){
                        arr.push(stories[i])
                    }
                }
            })
            // res.json({arr});
            setTimeout(()=> {
                res.json({arr})
            }, 100)
        }
    });
});



dishRouter.route('/blogs/:id').post(function(req, res){
    let uid = req.body.id;
    let blogId = req.params.id;
    let likeData = {}; let likeBlogs = [];
    Blog.findById(req.params.id, function(err, blog){
        if(!blog)
            res.status(404).send('Blog not found');
        else
            blog.total_likes = blog.total_likes+1;
            blog.liked = true

            blog.save().then(blog => {
                // res.json({total_likes: blog.total_likes})
                likeData.total_likes = blog.total_likes;
                User.findById(uid, (err, user)=> {
                    user.liked_blogs.push(blogId);
                    
                    user.save();
                    likeBlogs = user.liked_blogs;
                    res.json({likeData, likeBlogs})
                })
                // res.json({likeData, likeBlogs})
            })
            // .then(res => 
            //     User.findById(uid, (err, user)=> {
            //         user.liked_blogs.push(blogId);
            //         user.save();
            //         console.log(user);
            //     })
            //     )
            .catch(err => {
                res.status(400).send('Count not like');
            });
    });
});


app.use(express.static('./public'));

app.post('/upload', (req, res)=> {
    upload(req, res, (err) => {
        if(err){
            res.json({
                msg: err,
            });
        }else {
            res.json({
                msg: 'File uploaded',
                file: `upload/${req.file.filename}`
            });
        }
    })
});


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
// app.get('/', (req, res) => {

    // INSERT PRODUCT DATA 
    // for(let i=0; i<products.length; i++){
    //     let prod = new Shopping(products[i]);
    // prod.save()
    //     .then(prod => {
    //         res.status(200).json({prod: 'product added successfully'});
    //     })
    //     .catch(err => {
    //         res.status(400).send('adding producy failed');
    //     });
    // }

    // for(let i=0; i<dishData.length; i++){
        // let dish = new Dish(dishData[i]);
        // dish.save()
        //     .then(dish => {
        //         res.status(200).json({dish: 'dish added successfully'});
        //     })
        //     .catch(err => {
        //         res.status(400).send('adding dish failed');
        //     });
    // }

    // CHANGES IMAGE NAME AND SAVING INTO FOLDER
    // for(let i=0; i<products.length; i++){
    //     const options = {   
    //         url: products[i].img,
    //         dest: `public/upload/${i}oil.jpg`
    //     }
    //     download.image(options)
    //     .then(({filename}) => {
    //         products[i].img=`upload/${i}oil.jpg`;
    //     })
    //     .catch((err) => console.error(err));                
    // }
// })

// if(process.env.NODE_ENV === 'production') {
//     app.use(express.static('../client/build'));
// }

app.get('/',(req,res) => {
    return res.send('I am listening');
});





app.listen(port, () => console.log(`Server is listening at http://localhost:${port}`))