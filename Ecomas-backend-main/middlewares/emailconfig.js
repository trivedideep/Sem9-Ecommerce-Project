const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'deeptrivedi2002@gmail.com',
    pass: 'wptegvolskfymhaw'
  },
});

async function sendEmail(to, subject, text, html) {
  try {
    const mailOptions = {
      from: 'diptrivedi02@gmail.com', // sender address
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