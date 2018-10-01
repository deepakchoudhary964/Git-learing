const mongoose = require('mongoose');
const RefreshToken = mongoose.model('RefreshToken');
const User = mongoose.model('User');
const { generateToken } = require('../app/services/jwt');
const crypto = require('crypto');
const { validationResult } = require('express-validator/check');
const moment = require('moment');
const jwt = require('../app/services/jwt');

const validation = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.mapped() });
    }

    next();
};

const guardJwt = (req, res, next) => {
    if (!req.headers.authorization) {
        return res.status(401).send({
            error: 'Authorization header not found',
            errorCode: 'jwt.authorization_header_not_found'
        });
    }

    if (!req.headers.authorization.match(/^Bearer /)) {
        return res.status(401).send({
            error: 'Authorization header must start with Bearer',
            errorCode: 'jwt.authorization_header_invalid'
        });
    }

    const token = req.headers.authorization.split(' ')[1];
    try {
        const payload = jwt.decodeToken(token);
        User.findOne({_id: payload.id}, (err, user) => {
            if (err) throw err;

            if (!user) {
                return res.status(400).send({
                    error: 'User not found',
                    errorCode: 'jwt.user_not_found'
                });
            }

            req.user = user;
            next();
        });
    } catch (err) {
        return res.status(401).send({
            error: err.message,
            errorCode: (err.name == 'TokenExpiredError') ? 'jwt.token_expired' : 'jwt.token_invalid'
        });
    }
};

const injectJwt = (req, res, next) => {
    req.token = generateToken({id: req.user._id.toString()}, { expiresIn: '5m' });
    RefreshToken.findOne({user: req.user._id}, function(err, refreshToken) {
        if (err) throw err;

        let valid = moment().add(1, 'years');

        let token = generateToken({hash: crypto.createHash('md5').update(req.user._id.toString()).digest("hex")}, { expiresIn: '1y' });
        if (!refreshToken) {
            RefreshToken.create({
                user: req.user._id,
                token: token,
                valid: valid
            }, function(err, refreshToken) {
                if (err) return next(err);
                req.refreshToken = refreshToken.token;
                next();
            });
        } else if (refreshToken.valid < new Date()) {
            RefreshToken.where({_id: refreshToken._id}).update({ $set: {
                token: token,
                valid: valid
            }}, function(err, update) {
                if (err) return next(err);
                req.refreshToken = token;
                next();
            });
        } else {
            req.refreshToken = refreshToken.token;
            next();
        }
    });
};

module.exports = {
    injectJwt: injectJwt,
    guardJwt: guardJwt,
    validation: validation
};