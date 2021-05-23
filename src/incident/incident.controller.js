const express = require('express');
const router = express.Router();
const authorize = require('src/_middleware/authorize');

const Role = require('src/_helpers/role');
const Incident = require('./incident.model');
const _incidentService = require('./incident.service');
// routes
router.get('', authorize(Role.Admin), getAll);
router.get('/:id', authorize(), getById);
router.post('', authorize(Role.Admin), create);
router.put('/:id', authorize(Role.Admin), update);
router.post('/:id/acknowledge', authorize(), acknowledge);
router.post('/:id/resolve', authorize(), resolve);


module.exports = router;

/***
 *
 * @param req
 * @param res
 * @param next
 */
function getById(req, res, next) {
    const meta = {
        id: req.params.id
    }
    _incidentService.getById(req.params.id)
        .then(data => res.json({
            meta,
            data
        }))
        .catch(error => res.json({
            meta,
            error: {
                message: error
            }
        }))
        .finally(next);
}

/***
 *
 * @param req
 * @param res
 * @param next
 */
function getAll(req, res, next) {
    const options = req.query;
    const sort = options.sort || {};
    const filter = options.filter || {};
    const meta = {sort, filter};
    _incidentService.getAll(filter, sort)
        .then(data => {
            meta.total = data.length;
            res.json({
                meta,
                data
            })
        })
        .catch(error => res.json({
            meta,
            error: {
                message: error
            }
        }))
        .finally(next);
}

/***
 *
 * @param req
 * @param res
 * @param next
 */
function create(req, res, next) {
    const {typeOfIncident, location, datetimeOfIncident, nameOfAffected, nameOfSupervisor, descriptionOfIncident, rootCaseOfAccident, nameOfHandler} = req.body;
    const incident = new Incident({
        typeOfIncident,
        location,
        datetimeOfIncident,
        nameOfAffected,
        nameOfSupervisor,
        descriptionOfIncident,
        rootCaseOfAccident,
        nameOfHandler,
        isAcknowledged: false,
        tsAcknowledged: null,
        isResolved: false,
        comment: "",
        tsResolved: null,
        tsCreated: Date.now(),
        tsModified: Date.now(),
        modifiedBy: req.user.id,
        isActive: true
    });
    const meta = {};
    _incidentService.create(incident)
        .then(data => res.json({
            meta,
            data
        }))
        .catch(error => res.json({
            meta,
            error: {
                message: error
            }
        }))
        .finally(next);
}

/***
 *
 * @param req
 * @param res
 * @param next
 */
function update(req, res, next) {
    const id = req.params.id;
    const {typeOfIncident, location, datetimeOfIncident, nameOfAffected, nameOfSupervisor, descriptionOfIncident, rootCaseOfAccident, nameOfHandler} = req.body;

    _incidentService.getById(id)
        .then(response => {
            const incident = new Incident(response);
            incident.typeOfIncident = typeOfIncident;
            incident.location = location;
            incident.datetimeOfIncident =  datetimeOfIncident;
            incident.nameOfAffected = nameOfAffected;
            incident.nameOfSupervisor = nameOfSupervisor;
            incident.descriptionOfIncident = descriptionOfIncident;
            incident.rootCaseOfAccident = rootCaseOfAccident;
            incident.nameOfHandler = nameOfHandler;
            incident.tsModified = Date.now();
            incident.modifiedBy = req.user.id;
            const meta = {};
            _incidentService.update(id, incident)
                .then(data => res.json({
                    meta,
                    data
                }))
                .catch(error => res.json({
                    meta,
                    error: {
                        message: error
                    }
                }))
                .finally(next);
        });
}

/***
 *
 * @param req
 * @param res
 * @param next
 */
function acknowledge(req, res, next) {
    const id = req.params.id;
    _incidentService.getById(id)
        .then(response => {
            const incident = new Incident(response);

            incident.isAcknowledged = true;
            incident.tsAcknowledged = Date.now();
            incident.tsModified = Date.now();
            incident.modifiedBy = req.user.id;
            const meta = {};
            _incidentService.update(id, incident)
                .then(data => res.json({
                    meta,
                    data
                }))
                .catch(error => res.json({
                    meta,
                    error: {
                        message: error
                    }
                }))
                .finally(next);
        });
}

/***
 *
 * @param req
 * @param res
 * @param next
 */
function resolve(req, res, next) {
    const id = req.params.id;
    const {comment} = req.body;
    _incidentService.getById(id)
        .then(response => {
            const incident = new Incident(response);

            incident.isResolved = true;
            incident.tsResolved = Date.now();
            incident.comment = comment;
            incident.tsModified = Date.now();
            incident.modifiedBy = req.user.id;
            const meta = {};
            _incidentService.update(id, incident)
                .then(data => res.json({
                    meta,
                    data
                }))
                .catch(error => res.json({
                    meta,
                    error: {
                        message: error
                    }
                }))
                .finally(next);
        });
}
