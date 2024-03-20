const nodemailer = require("nodemailer");


 const transporter = nodemailer.createTransport({
    host: process.env.Email_Host,
    port: 465,
    secure: true,
    auth: {
      user: process.env.Email_User,
      pass: process.env.Email_Pass
    }
  
  });

  module.exports = transporter;
