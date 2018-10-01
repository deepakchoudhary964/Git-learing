const jwt = require('jsonwebtoken');
const config = require('../../config');

const generateToken = (payload, options) => {
    return jwt.sign(payload, config.jwt.secret, Object.assign({ algorithm: config.jwt.algorithm}, options));
};

const decodeToken = (token) => {
    return jwt.verify(token, config.jwt.secret, { algorithms: [config.jwt.algorithm] });
};

module.exports = {
    generateToken: generateToken,
    decodeToken: decodeToken
};