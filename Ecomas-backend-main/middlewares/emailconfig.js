const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  },
});

async function sendEmail(to, subject, text, html) {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM, // sender address
      to: to,                            // recipient address
      subject: subject,                  // subject line
      text: text,                        // plain text body
      html: html                         // html body
    };
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ', to);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email: ', error);
    return { success: false, error: error.message };
  }
}

module.exports = sendEmail;