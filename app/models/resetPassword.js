const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ResetPasswordSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    token: String,
    valid: Date
}, {
    toObject: {
        transform: function (doc, ret) {
            delete ret._id;
        }
    },
    toJSON: {
        transform: function (doc, ret) {
            delete ret._id;
        }
    }
});

mongoose.model('ResetPassword', ResetPasswordSchema);
