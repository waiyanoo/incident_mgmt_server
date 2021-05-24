const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    typeOfIncident: { type: String, required: true },
    location: { type: String,  required: true },
    datetimeOfIncident: { type: String, required: true },
    nameOfAffected: { type: String, required: true },
    nameOfSupervisor: { type: String, required: true },
    descriptionOfIncident: { type: String },
    rootCaseOfAccident: { type: String, required: true },
    nameOfHandler: { type: String},
    isAcknowledged: { type: Boolean},
    tsAcknowledged: { type: Date },
    isResolved: { type: Boolean},
    comment: { type: String},
    tsResolved: {type: Date},
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
    }
});

module.exports = mongoose.model('Incident', schema);
