const nodemailer = require('nodemailer');
const config = require('../../config');
const path = require('path');
const Email = require('email-templates');
const transporter = nodemailer.createTransport({
    host: config.mailer.host,
    port: config.mailer.port,
    secure: config.mailer.secure, // true for 465, false for other ports
    auth: {
        user: config.mailer.auth.user, // generated ethereal user
        pass: config.mailer.auth.pass  // generated ethereal password
    }
});

const email = new Email({
    message: {
         from: '"NomadPlay" <noreply@nomadplay-app.com>'

    },
    transport: transporter,
    views: {
        root: path.join(__dirname, '../templates'),
        options: {
            extension: 'ejs' // <---- HERE
        }
    }
});

const sendResetPasswordToken = (user, token) => {
    
    const output = `
    <p>Bonjour ${user.first_name},</p>\n 
    <p>Vous avez effectué une demande de réinitialisation de votre mot de passe.</p>\n 
    <p>Pour continuer, veuillez entrer ce code <b>${token}</b> dans l'application.</p>\n 
    <p>Si vous n'avez pas effectué de demande de réinitialisation du mot de passe, merci d'ignorer ce mail.</p>\n
    `;
    message = {

        to: user.email, // list of receivers
        subject: "Réinitialisation de votre mot de passe", // Subject line

        html: output // html body
    };
    transporter.sendMail(message, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message sent: %s', info.messageId);

        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
        res.render('contact', { msg: 'Contact request sent' })

    });
    // return email.send({
    //     template: 'simple',
    //     message: {
    //         to: user.email,
    //         subject: 'Réinitialisation de votre mot de passe',
    //     },
    //     locals: {
    //         content: '' +
    //             `<p>Bonjour ${user.first_name},</p>\n` +
    //             '<p>Vous avez effectué une demande de réinitialisation de votre mot de passe.</p>\n' +
    //             `<p>Pour continuer, veuillez entrer ce code <b>${resetPassword.token}</b> dans l'application.</p>\n` +
    //             `<p>Si vous n'avez pas effectué de demande de réinitialisation du mot de passe, merci d'ignorer ce mail.</p>\n`
    //     }
    // });
};

const generateUniqueSignUpToken = (user, token, protocol, host) => {

    const output = `
<h1>Confirme ton email</h1> 
<p>Bonjour ${user.first_name},</p>\n
<p>Nous avons reçu une demande d'enregistrement.</p>\n
<p> veuillez cliquer sur le lien suivant pour vérifier votre adresse e-mail </p> \n\n\n 
<button><a href="${protocol}://${host}/verifyemail/${user.email}/${token}" target="_blank"> Cliquez ici pour vérifier</a> </button>
`;

    message = {

        to: user.email, // list of receivers
        subject: "Vérification de l'E-mail", // Subject line

        html: output // html body
    };

    // send mail with defined transport object
    transporter.sendMail(message, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message sent: %s', info.messageId);

        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
        res.render('contact', { msg: 'Contact request sent' })

    });

};
module.exports = {
    sendResetPasswordToken: sendResetPasswordToken,
    generateUniqueSignUpToken: generateUniqueSignUpToken
};