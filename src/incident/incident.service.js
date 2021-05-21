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
        throw 'User create failed'
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
        throw 'Incident update failed.'
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
