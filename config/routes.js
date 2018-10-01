const mongoose = require('mongoose');
const User = mongoose.model('User');
const { check } = require('express-validator/check');

const middlewares = require('./middlewares');
const authController = require('../app/controllers/auth.controller');
const userController = require('../app/controllers/user.controller');
const concertController = require('../app/controllers/concerts.controller');
const instrumentController = require('../app/controllers/instruments.controller');
const compositionController = require('../app/controllers/compositions.controller')
const checkPassword = check('password', 'Password must be at least 5 chars long').exists().isLength({ min: 5 });

module.exports = function (app) {
    app.post('/login', [
        check('email').isEmail().exists().trim().isLength({ min: 1 }),
        check('password').exists().trim().isLength({ min: 1 })
    ], middlewares.validation, authController.login, middlewares.injectJwt, (req, res) => {
        res.status(200).send(Object.assign({
            token: req.token,
            refresh_token: req.refreshToken
        }, req.user.toJSON()));
    });

    app.post('/login/google', [
        check('access_token').exists().trim().isLength({ min: 1 }),
    ], middlewares.validation, authController.loginWithGoogle, middlewares.injectJwt, (req, res) => {
        res.status(200).send(Object.assign({
            token: req.token,
            refresh_token: req.refreshToken
        }, req.user.toJSON()));
    });

    app.post('/login/facebook', [
        check('access_token').exists().trim().isLength({ min: 1 }),
    ], middlewares.validation, authController.loginWithFacebook, middlewares.injectJwt, (req, res) => {
        res.status(200).send(Object.assign({
            token: req.token,
            refresh_token: req.refreshToken
        }, req.user.toJSON()));
    });

    app.post('/signup', [
        check('email')
            .isEmail()
            .trim().isLength({ min: 1 })
            .custom(value => {
                return User.findOne({ 'email': value }).exec().then(user => {
                    if (user) throw new Error('This email is already in use');
                    return true;
                })
            }),
        checkPassword,
        check('birthday').optional().isISO8601(),
        check('subscribe_partners').isBoolean()
    ], middlewares.validation, authController.signup, middlewares.injectJwt, (req, res) => {
        res.status(201).send(Object.assign({
            token: req.token,
            refresh_token: req.refreshToken
        }, req.user.toJSON()));
    });

    app.patch('/user', [
        check('birthday').optional().isISO8601(),
        check('subscribe_partners').optional().isBoolean()
    ], middlewares.guardJwt, middlewares.validation, userController.update, middlewares.injectJwt, (req, res) => {
        res.status(200).send(req.user);
    });

    app.get('/user/me', middlewares.guardJwt, (req, res) => {
        res.status(200).send(req.user);
    });

    app.post('/refresh-token', [
        check('refresh_token').exists().trim().isLength({ min: 1 })
    ], middlewares.validation, authController.refreshToken, (req, res) => {
        res.status(200).send({
            token: req.token,
            refresh_token: req.refreshToken
        });
    });

    app.post('/forgot-password', [
        check('email').isEmail().exists().trim().isLength({ min: 1 })
    ], middlewares.validation, authController.forgotPassword, (req, res) => {
        res.status(204).send();
    });

    app.post('/reset-password', [
        check('token').exists().trim().isLength({ min: 1 }),
        checkPassword
    ], middlewares.validation, authController.resetPassword, (req, res) => { 
        res.status(204).send();
    });

    app.post('/user/change-password', [
        checkPassword
    ], middlewares.guardJwt, middlewares.validation, userController.changePassword, (req, res) => {
        res.status(204).send();
    });
     
    // Stripe
    app.post('/stripe/update-card', middlewares.guardJwt, userController.updateCard, (req, res) => {
        res.status(204).send();
    });
    app.post('/stripe/pay-transaction', middlewares.guardJwt, userController.payTransaction, (req, res) => {
        res.status(204).send();
    });

    // verification of registered email 
    app.get('/verifyemail/:email/:token', authController.emailVerification, (req, res) => {
        res.status(204).send();
    });  
    
    // crud operation for concerts
    app.post('/concerts', middlewares.guardJwt, concertController.create, (req, res) => {
        res.status(204).send();
    });
    app.get('/concerts', middlewares.guardJwt, concertController.findAll, (req, res) => {
        res.status(204).send();
    });

    app.get('/concerts/:id', middlewares.guardJwt, concertController.findOne, (req, res) => {
        res.status(204).send();
    });
    app.get('/concerts/search/:text', concertController.findByText, (req, res) => {
        res.status(204).send();
    });

    app.put('/concerts/:id', middlewares.guardJwt, concertController.update, (req, res) => {
        res.status(204).send();
    });
    app.delete('/concerts/:id', middlewares.guardJwt, concertController.delete, (req, res) => {
        res.status(204).send();
    });

    // crud operations for instruments_en
    app.post('/instruments/en', middlewares.guardJwt, instrumentController.create, (req, res) => {
        res.status(204).send();
    });
    app.get('/instruments/en', middlewares.guardJwt, instrumentController.findAll, (req, res) => {
        res.status(204).send();
    });
    app.get('/instruments/en/:id', middlewares.guardJwt, instrumentController.findOne, (req, res) => {
        res.status(204).send();
    });
    app.get('/instruments/en/search/:text', middlewares.guardJwt, instrumentController.findByText, (req, res) => {
        res.status(204).send();
    });
    app.put('/instruments/en/:id', middlewares.guardJwt, instrumentController.update, (req, res) => {
        res.status(204).send();
    });
    app.delete('/instruments/en/:id', middlewares.guardJwt, instrumentController.delete, (req, res) => {
        res.status(204).send();
    });

    // crud operations for instruments_fr
    app.post('/instruments/fr', middlewares.guardJwt, instrumentController.create, (req, res) => {
        res.status(204).send();
    });
    app.get('/instruments/fr', middlewares.guardJwt, instrumentController.findAll, (req, res) => {
        res.status(204).send();
    });
    app.get('/instruments/fr/:id', middlewares.guardJwt, instrumentController.findOne, (req, res) => {
        res.status(204).send();
    });
    app.get('/instruments/fr/search/:text', middlewares.guardJwt, instrumentController.findByText, (req, res) => {
        res.status(204).send();
    });
    app.put('/instruments/fr/:id', middlewares.guardJwt, instrumentController.update, (req, res) => {
        res.status(204).send();
    });
    app.delete('/instruments/fr/:id', middlewares.guardJwt, instrumentController.delete, (req, res) => {
        res.status(204).send();
    });

    // crud operationss for compositions_en
    app.post('/compositions/en', middlewares.guardJwt, compositionController.create, (req, res) => {
        res.status(204).send();
    });
    app.get('/compositions/en', middlewares.guardJwt, compositionController.findAll, (req, res) => {
        res.status(204).send();
    });
    app.get('/compositions/en/:id', middlewares.guardJwt, compositionController.findOne, (req, res) => {
        res.status(204).send();
    });
    app.get('/compositions/en/search/:text', middlewares.guardJwt, compositionController.findByText, (req, res) => {
        res.status(204).send();
    });
    app.put('/compositions/en/:id', middlewares.guardJwt, compositionController.update, (req, res) => {
        res.status(204).send();
    });
    app.delete('/compositions/en/:id', middlewares.guardJwt, compositionController.delete, (req, res) => {
        res.status(204).send();
    });

    // crud operation for compositions_fr
    app.post('/compositions/fr', middlewares.guardJwt, compositionController.create, (req, res) => {
        res.status(204).send();
    });
    app.get('/compositions/fr', middlewares.guardJwt, compositionController.findAll, (req, res) => {
        res.status(204).send();
    });
    app.get('/compositions/fr/:id', middlewares.guardJwt, compositionController.findOne, (req, res) => {
        res.status(204).send();
    });
    app.get('/compositions/fr/search/:text', middlewares.guardJwt, compositionController.findByText, (req, res) => {
        res.status(204).send();
    });
    app.put('/compositions/fr/:id', middlewares.guardJwt, compositionController.update, (req, res) => {
        res.status(204).send();
    });
    app.delete('/compositions/fr/:id', middlewares.guardJwt, compositionController.delete, (req, res) => {
        res.status(204).send();
    });
    
    // operations for record
    app.post('/user/records/create', middlewares.guardJwt, userController.createRecord, (req, res) => {
        res.status(204).send();
    });
    app.get('/user/records/:id', middlewares.guardJwt, userController.findOnecompositionRecord, (req, res) => {
        res.status(204).send();
    });
    app.get('/user/records/', middlewares.guardJwt, userController.findAll, (req, res) => {
        res.status(204).send();
    });
    app.delete('/user/records/:id', middlewares.guardJwt, userController.deleteRecord, (req, res) => {
        res.status(204).send();
    });
    app.post('/user/createcustomer/record',  userController.createCoustomer, (req, res) => {
        res.status(204).send();
    });
    app.post('/user/createsource',  userController.createSource, (req, res) => {
        res.status(204).send();
    });
    app.post('/user/createcharge',  userController.createCharge, (req, res) => {
        res.status(204).send();
    });
    app.post('/user/createplan',  userController.createPlan, (req, res) => {
        res.status(204).send();
    });
    app.post('/user/creat/subscription',  userController.createSubscription, (req, res) => {
        res.status(204).send();
    });
    app.post('/user/update/plan',  userController.updatePlan, (req, res) => {
        res.status(204).send();
    });
    app.post('/user/get/invoice',  userController.getInvoice, (req, res) => {
        res.status(204).send();
    });
    app.post('/user/update/subscription',  userController.updateSubscription, (req, res) => {
        res.status(204).send();
    });
    app.post('/user/unsubscription',  userController.unSubscribe, (req, res) => {
        res.status(204).send();
    });

};
