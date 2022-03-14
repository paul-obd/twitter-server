const nodemailer = require('nodemailer');
//const { google } = require('googleapis');

// These id's and secrets should come from .env file.
// const CLIENT_ID = '562241463872-2q457q452k3aqgi1k6mep2ig83dfp1r1.apps.googleusercontent.com';
// const CLEINT_SECRET = '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';
// const REDIRECT_URI = 'https://developers.google.com/oauthplayground';
// const REFRESH_TOKEN = '1//04aSHI20RJZw_CgYIARAAGAQSNwF-L9IrAVPH9fhE1SjcurmPLQ9bIZ1J1WAt_gjJBw44OMO7EoZ1LJKAqRrSIgmL3lB7-hMacbA';

// const oAuth2Client = new google.auth.OAuth2(
//   CLIENT_ID,
//   CLEINT_SECRET,
//   REDIRECT_URI
// );
// oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });




exports.sendEmail = async (email, subject, text, html) => {


  try {
   // const accessToken = await oAuth2Client.getAccessToken();
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
       // type: 'OAuth2',
        user: process.env.EMAIL,
        pass: 'melhem111'
        // clientId: CLIENT_ID,
        // clientSecret: CLEINT_SECRET,
        // refreshToken: REFRESH_TOKEN,
        // accessToken: accessToken,
      }
    });

    const mailOptions = {
      from: 'Twitter from AliExpress <process.env.EMAIL>',
      to: email,
      subject: subject,
      text: text,
      html: html
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(result)
    return result
    
  }

  catch (error) {
    let err = new Error('Email err: '+ error.message)
    return err

  }
}