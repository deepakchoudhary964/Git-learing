const mongoose = require('mongoose');
const User = mongoose.model('User');
const RefreshToken = mongoose.model('RefreshToken');
const CheckExpiryForEmailVerifyLink = process.env.CHECK_EXPIRY_EMAIL_VERIFY_LINK;
const ResetPassword = mongoose.model('ResetPassword');
const { generateToken } = require('../services/jwt');
const { sendResetPasswordToken } = require('../services/mail');
const { generateUniqueSignUpToken } = require('../services/mail');
const { generateUniqueResetPasswordToken } = require('../services/resetPassword');
const { generateUserPasswordHash, validPassword, createUserFromFacebookData, createUserFromGoogleData } = require('../services/user');
const moment = require('moment');
const config = require('../../config');
const google = require('googleapis');
const oauth2 = google.oauth2('v2');
const OAuth2 = google.auth.OAuth2;
const authClient = new OAuth2(config.google.oauth2.client_id, config.google.oauth2.secret);
const fbgraph = require('fbgraph');
const logger = require('../../config/logger');
const nodemailer = require('nodemailer');
const cryptoRandomString = require('crypto-random-string');

const login = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    User.findOne({ 'email': email }, (err, user) => {
        if (err || !user) {
            return res.status(401).send({
                error: 'Unable to find user by email',
                errorCode: 'login.user_not_found'
            });
        }

        if (user.provider != 'local' && !user.hashed_password) {
            return res.status(401).send({
                error: 'Unable to login by password. User was created with ' + user.provider + ' provider and has not defined a password',
                errorCode: 'login.user_password_not_defined'
            });
        }

        if (!validPassword(password, user.hashed_password)) {
            return res.status(401).send({
                error: "Email and password don't match",
                errorCode: 'login.credentials_invalid'
            });
        }

        req.user = user;
        next();
    });
};

const loginWithGoogle = (req, res, next) => {
    authClient.credentials = {
        access_token: req.body.access_token
    };

    oauth2.userinfo.get({
        auth: authClient,
    }, (err, data) => {
        if (err) return next(err);

        User.findOne({ email: data.email }, (err, user) => {
            if (err) return next(err);

            if (!user) {
                createUserFromGoogleData(data).then(user => {
                    if (err) return next(err);
                    req.user = user;
                    next();
                }).catch(next);
            } else {
                req.user = user;
                next();
            }
        });
    })
};

const loginWithFacebook = (req, res, next) => {
    fbgraph.setAccessToken(req.body.access_token);
    fbgraph.setVersion('2.11');
    fbgraph.get('me?fields=birthday,email,first_name,last_name', (err, data) => {
        if (err) return next(new Error(err.message));
        User.findOne({ email: data.email }, (err, user) => {
            if (err) return next(err);

            if (!user) {
                createUserFromFacebookData(data).then(user => {
                    if (err) return next(err);
                    req.user = user;
                    next();
                }).catch(next);
            } else {
                req.user = user;
                next();
            }
        });
    });
};

const signup = (req, res, next) => {
    let newUser = new User();
    newUser.email = req.body.email;
    newUser.hashed_password = generateUserPasswordHash(req.body.password);
    newUser.first_name = req.body.first_name;
    newUser.last_name = req.body.last_name;
    newUser.city = req.body.city;
    newUser.birthday = req.body.birthday;
    newUser.instruments = req.body.instruments;
    newUser.downloads = req.body.downloads;
    newUser.subscribe_partners = undefined === req.body.subscribe_partners ? false : req.body.subscribe_partners;
    newUser.verificationToken = cryptoRandomString(6).toUpperCase();
    newUser.valid = Date.now();
    // newUser.valid= moment().add(1, 'days');
    let protocol = req.protocol;
    let host = req.get('host');

    newUser.save((err) => {
        generateUniqueSignUpToken(newUser, newUser.verificationToken, protocol, host);
        if (err) return next(err);
        req.user = newUser;
        next();
    });

};


const emailVerification = (req, res, next) => {
    User.findOne({ email: req.params.email }, (err, user) => {
        if (err) return next(err);
        if (!user) {
            return res.status(400).send({
                error: 'User not found',
                errorCode: 'emailVerification.email_not_found'
            });
        } else {
console.log('check validation',req.params.token,user.verificationToken)
            if (req.params.token == user.verificationToken) {
                let userAttribute = {};
                userAttribute.isVerified = true    
                console.log('check emailverification',Date.now() , user.valid )           
                if (CheckExpiryForEmailVerifyLink == "yes") {                   
                    if (Date.now() - user.valid > 86400000) {
                        return res.status(400).send({
                            error: 'Email Registration token already sent',
                            errorCode: 'Email_Registration.Email_Registration_token_already_sent'
                        });
                    }
                }
                User.update({ email: req.params.email }, userAttribute, (err, result) => {
                    if (err) {
                        return res.status(500).send(err);
                    }
                    return res.status(200).json(`email vérifié avec succès`);
                });
            }
        }
    })
}

const forgotPassword = (req, res, next) => {
    User.findOne({ email: req.body.email }, (err, user) => {
        if (err) return next(err);

        if (!user) {
            return res.status(400).send({
                error: 'User not found',
                errorCode: 'forgot_password.user_not_found'
            });
        }

        if (user.provider != 'local' && !user.hashed_password) {
            return res.status(401).send({
                error: 'Unable to send reset password link. User was created with ' + user.provider + ' provider and has not defined a password.',
                errorCode: 'forgot_password.user_password_not_defined'
            });
        }

        generateUniqueResetPasswordToken().then(token => {
            const valid = moment().add(1, 'days');
            ResetPassword.findOne({ user: user._id }, (err, resetPassword) => {
                if (resetPassword) {
                    // if (resetPassword.valid > new Date()) {
                    //     return res.status(400).send({
                    //         error: 'Reset password token already sent',
                    //         errorCode: 'forgot_password.reset_password_token_already_sent'
                    //     });
                    // }

                    ResetPassword.where({ _id: resetPassword._id }).update({
                        $set: {
                            token: token,
                            valid: valid
                        }
                    }, function (err, resetPassword) {
                        if (err) return next(err);

                        sendResetPasswordToken(user, token);
                        next();
                    });
                } else {
                    ResetPassword.create({
                        user: user._id,
                        token: token,
                        valid: valid
                    }, function (err, resetPassword) {
                        if (err) return next(err);

                        sendResetPasswordToken(user, token);
                        next();
                    });
                }
            });
        });
    });
};

const resetPassword = (req, res, next) => {
    ResetPassword.findOne({ token: req.body.token }, (err, resetPassword) => {
        if (err) return next(err);

        if (!resetPassword) {
            return res.status(400).send({
                error: 'Reset password token not found',
                errorCode: 'reset_password.token_not_found'
            });
        }

        if (resetPassword.valid < new Date()) {
            return res.status(400).send({
                error: 'Reset password token expired',
                errorCode: 'reset_password.token_expired'
            });
        }

        User.findOne({ _id: resetPassword.user }, (err, user) => {
            if (err) return next(err);

            if (!user) {
                return res.status(400).send({
                    error: 'User not found',
                    errorCode: 'reset_password.user_not_found'
                });
            }

            User.where({ _id: user._id }).update({
                $set: {
                    hashed_password: generateUserPasswordHash(req.body.password)
                }
            }, function (err) {
                if (err) return next(err);

                ResetPassword.remove({ _id: resetPassword._id }, (err, removed) => {
                    if (err) return next(err);

                    next();
                });
            });
        });
    });
};

const refreshToken = (req, res, next) => {
    const refreshToken = req.body.refresh_token;

    RefreshToken.findOne({ token: refreshToken }, function (err, refreshToken) {
        if (err) return next(err);

        if (!refreshToken) {
            return res.status(401).json({
                error: "Invalid refresh token",
                errorCode: 'jwt.refresh_token_invalid'
            });
        }

        if (refreshToken.valid < new Date()) {
            return res.status(401).json({
                error: "Expired refresh token",
                errorCode: 'jwt.refresh_token_expired'
            });
        }

        User.findOne({ _id: refreshToken.user }, function (err, user) {
            if (err) return next(err);

            req.token = generateToken({ id: user._id.toString() }, { expiresIn: '5m' });
            req.refreshToken = refreshToken.token;
            next();
        });
    });
};


module.exports = {
    login: login,
    loginWithGoogle: loginWithGoogle,
    loginWithFacebook: loginWithFacebook,
    signup: signup,
    refreshToken: refreshToken,
    forgotPassword: forgotPassword,
    resetPassword: resetPassword,
    emailVerification: emailVerification
};