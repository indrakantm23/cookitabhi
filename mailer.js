var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'mevishal23@gmail.com',
    pass: 'kusumavishal'
  }
});

var mailOptions = {
  from: '"Cook it abhi" <mevishal23@gmail.com>',
  to: 'indrakantm23@gmail.com',
  subject: 'Password reset',
  html: "Hi Indrakant Mishra <br/><br/>You can reset your password using following <b><a href='https://google.com'>password reset link</a></b>.<br/><br/>Thanks,<br/>Cookitabhi",

};

transporter.sendMail(mailOptions, function(error, info){
  if (error) {
    console.log(error);
  } else {
    console.log('Email sent: ' + info.response);
  }
});