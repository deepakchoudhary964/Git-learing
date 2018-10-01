const mongoose = require('mongoose');
const User = mongoose.model('User');
const ResetPassword = mongoose.model('ResetPassword');
const bcrypt = require('bcrypt');

module.exports = {
    generateUserPasswordHash: (password) => {
        return bcrypt.hashSync(password, bcrypt.genSaltSync(8));
    },
    validPassword: (password, hashed_password) => {
        return bcrypt.compareSync(password, hashed_password);
    },
    createUserFromGoogleData: (data) => {
        console.log(data);
        let newUser = new User();
        newUser.email = data.email;
        newUser.first_name = data.given_name;
        newUser.last_name = data.family_name;
        newUser.birthday = data.birthday;
        newUser.provider = 'google';

        return newUser.save();
    },
    createUserFromFacebookData: (data) => {
        let newUser = new User();
        newUser.email = data.email;
        newUser.first_name = data.first_name;
        newUser.last_name = data.last_name;
        newUser.birthday = data.birthday;
        newUser.provider = 'facebook';

        return newUser.save();
    }
};