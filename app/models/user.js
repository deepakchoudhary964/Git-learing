const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    provider: {
        type: String,
        default: 'local'
    },
    email: {
        type: String,
        required: true
    },
    hashed_password: {
        type: String
    },
    first_name: {
        type: String
    },
    last_name: {
        type: String
    },
    birthday: {
        type: Date
    },
    city: {
        type: String
    },
    instruments: {
        type: Array,
        default: []
    },
    subscribe_partners: {
        type: Boolean,
        default: false
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    downloads: {
        type: Array,
        default: []
    },
    stripe_customer_id: {
        type: String
    },
    planID:{
        type:String
    },
    productID:{
        type:String
    },unsubscribe_Id:{
        type:String
    },
    records: {
        type: Array,
        default: [
            {
                compositionid: String,
                filename: String,
                fileurl: String,
            }
        ]
    },
    verificationToken: {
        type: String,
    },
    valid: {
        type: Number
    }
},
    {
        toJSON: {
            transform: function (doc, ret) {
                delete ret._id;
                delete ret.__v;
                delete ret.hashed_password;
            }
        }
    });

mongoose.model('User', UserSchema);