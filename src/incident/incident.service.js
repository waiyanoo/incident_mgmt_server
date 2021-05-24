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
 * @param id
 * @returns {Promise<Incident>}
 */
async function getById(id) {
    try{
        return await getIncident(id);
    }catch (e) {
        throw 'Failed to retrieve incident'
    }
}

/**
 *
 * @param filter
 * @param sort
 * @returns {Promise<Array<EnforceDocument<unknown, {}>>>}
 */
async function getAll(filter, sort) {
    filter.isActive = true;
    let mongoFilter = {$and : []};
    try{
        mongoFilter.$and.push({ isActive: true });
        filter.typeOfIncident ?  mongoFilter.$and.push({typeOfIncident : filter.typeOfIncident }) : '';
        return await db.Incident.find(mongoFilter).sort().exec();
    }catch (e) {
        console.log(e);
        throw 'Failed to retrieve incident'
    }

}

/***
 *
 * @param data
 * @returns {Promise<Incident>}
 */
async function create(data) {
    try{
        const incident = new db.Incident(data);
        await incident.save();
        return incident;
    }
    catch (e) {
        console.log(e);
        throw 'Failed to create incident data'
    }
}

/**
 *
 * @param id : string
 * @param data
 * @returns {Promise<Incident>}
 */
async function update(id, data) {
    try{
        const filter = { _id: id };
        const update = updateModel(data);
        let doc;
        doc = await db.Incident.findOneAndUpdate(filter, update, {
            new: true
        });
        return new Incident(doc);
    }
    catch (e) {
        throw 'Failed to update incident data'
    }
}

/***
 *
 * @param id : string
 * @returns {Promise<Incident>}
 */
async function getIncident(id) {
    try{
        if (!db.isValidId(id)) throw 'Incident data not found';

        const incident = await db.Incident.findById(id);
        if (!incident) throw 'Incident data not found';
        return incident;
    }catch (e) {
        throw 'Failed to retrieve incident'
    }
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
