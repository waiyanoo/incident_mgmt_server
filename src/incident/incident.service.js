const db = require('src/_helpers/db');
const { Incident } = require('../_helpers/db');

module.exports = {
    getAll,
    getById,
    create,
    update,
};

/**
 *
 * @param id : string
 * @returns {Promise<Incident>}
 */
async function getById(id) {
    return await getIncident(id);
}

/**
 *
 * @returns {Promise<Query<Array<EnforceDocument<Incident, {}>>, Document<any, any>, {}>>}
 */
async function getAll() {
    return db.Incident.find();
}

/***
 *
 * @param data
 * @returns {Promise<Incident>}
 */
async function create(data) {
    const incident = new db.Incident(data);
    try{
        await incident.save();
    }
    catch (e) {
        throw 'Failed to create incident data'
    }
    return incident;
}

/**
 *
 * @param id : string
 * @param data
 * @returns {Promise<Incident>}
 */
async function update(id, data) {
    const filter = { _id: id };
    const update = updateModel(data);
    let doc;
    try{
        doc = await db.Incident.findOneAndUpdate(filter, update, {
            new: true
        });
    }
    catch (e) {
        throw 'Failed to update incident data'
    }
    return new Incident(doc);
}

/***
 *
 * @param id : string
 * @returns {Promise<Incident>}
 */
async function getIncident(id) {
    if (!db.isValidId(id)) throw 'Incident data not found';

    const incident = await db.Incident.findById(id);
    if (!incident) throw 'Incident data not found';
    return incident;
}


/***
 *
 * @param user
 * @returns {{role, tsModified, name, fullName, modifiedBy, isActive}}
 */
function updateModel(incident) {
    const {typeOfIncident, location, datetimeOfIncident, nameOfAffected, nameOfSupervisor, descriptionOfIncident, rootCaseOfAccident, nameOfHandler, isAcknowledged, tsAcknowledged, isResolved, comment, tsResolved, tsModified, isActive, modifiedBy} = incident;
    return { typeOfIncident, location, datetimeOfIncident, nameOfAffected, nameOfSupervisor, descriptionOfIncident, rootCaseOfAccident, nameOfHandler, isAcknowledged, tsAcknowledged, isResolved, comment, tsResolved, tsModified, isActive, modifiedBy};
}
