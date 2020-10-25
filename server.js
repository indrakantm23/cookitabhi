require('dotenv').config();
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
const dishData = require('./scrape/dishes');

const faker = require('faker');
const download = require('image-downloader');



require('./Authentication/passport')(passport);

// IMPORTING MODEL
const Dish = require('./model/dish.model');
const Blog = require('./model/blog.model');
const User = require('./model/user.model');
const Story = require('./model/story.model');
const Shopping = require('./model/shopping.model');
// const { config } = require('dotenv/types');

app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

// EXPRESS ROUTERS
app.use('/dishes', dishRouting);
app.use('/users', userRouter);
app.use('/blogs', blogRouter);
app.use('/products', productRouter);
app.use('/stories', storyRouter);


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
                host: 'smtp.gmail.com',
                port: 465, //465 587
                secure: true,
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

    // for(let i=0; i<dishData.dishes.length; i++){
    //     let dish = new Dish(dishData.dishes[i]);
    //     dish.save()
    //         .then(dish => {
    //             res.status(200).json({dish: 'dish added successfully'});
    //         })
    //         .catch(err => {
    //             res.status(400).send('adding dish failed');
    //         });
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

// app.get('/',(req,res) => {
//     return res.send('I am listening');
// });

const posts = [
    {name: 'Indrakant', title: 'Engineer'},
    {name: 'Vishal', title: 'Doctor'}
]

app.get("/posts", authenticaseToken, (req, res) => {
    res.json(posts.filter(post => post.name == req.user.name));
    
})

app.post('/auth', (req, res) => {
    const username = req.body.username;
    const user = { name: username }

    const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET)
    res.json({accessToken: accessToken});
    console.log({accessToken})
})

function authenticaseToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if(token == null) return res.sendStatus(401)

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if(err) return res.sendStatus(403);
        req.user = user;
        next();
    })
}


app.listen(port, () => console.log(`Server is listening at http://localhost:${port}`))