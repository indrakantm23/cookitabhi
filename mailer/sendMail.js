var nodemailer = require('nodemailer');

// SEND WELCOME MAIL AFTER USER SIGNUP
const sendOnboardingMail = (name, email) =>{
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
        
        var mailOptions = {
            from: '"Cook it abhi" <mevishal23@gmail.com>',
            to: email,
            subject: 'Welcome to Cook it abhi',
            html: `Hi ${name}, <br/><br/>We welcome you to the Cookitabhi platform :) <br/>You can now access complete platform like Shopping, Connecting with people, reading and writing blogs, posting stories and much more! <br/><br/>Your much friendly cooking app,<br/>Cookitabhi`,
            };
        
        transporter.sendMail(mailOptions, function(error, info){
            if (error) {
                console.log(error);
            } else {
                res.json({status: 200, msg: `Email sent to ${email}`})
            }
            });
    }





    

    exports.sendOnboardingMail = sendOnboardingMail;