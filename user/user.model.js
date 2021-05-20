const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    fullName: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    passwordHash: { type: String, required: true },
    role: { type: String, required: true },
    registeredDate: { type: Date },
    expiredDate: { type: String },
    isActive: { type: Boolean },
    tsCreated: { type: Date },
    tsModified: { type: Date },
    modifiedBy: { type: String },
});

schema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) {
        // remove these props when object is serialized
        delete ret._id;
        delete ret.passwordHash;
    }
});

module.exports = mongoose.model('User', schema);
