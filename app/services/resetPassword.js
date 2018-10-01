const mongoose = require('mongoose');
const ResetPassword = mongoose.model('ResetPassword');
const cryptoRandomString = require('crypto-random-string');

module.exports.generateUniqueResetPasswordToken = () => {
    const generateToken = () => {
        let token = cryptoRandomString(6).toUpperCase();
        return ResetPassword.findOne({token: token}).then((err, resetPassword) => {
            if (err) throw err;
            if (resetPassword) {
                return generateToken();
            }

            return token;
        });
    };
    return generateToken();
};