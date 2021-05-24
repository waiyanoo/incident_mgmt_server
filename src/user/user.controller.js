const express = require('express');
const router = express.Router();
const Joi = require('@hapi/joi');
const validateRequest = require('src/_middleware/validate-request');
const authorize = require('src/_middleware/authorize');
const Role = require('src/_helpers/role');
const userService = require('./user.service');
const User = require('./user.model');
const bcrypt = require('bcryptjs');

// routes
router.post('/authenticate', authenticateSchema, authenticate);
router.get('', authorize(Role.Admin), getAll);
router.get('/:id', authorize(), getById);
router.post('', authorize(Role.Admin), create);
router.put('/:id', authorize(Role.Admin), update);
router.put('/:id/reset-password', authorize(), changePassword)

module.exports = router;

/***
 *
 * @param req
 * @param res
 * @param next
 */
function authenticateSchema(req, res, next) {
    const schema = Joi.object({
        email: Joi.string().required(),
        password: Joi.string().required()
    });
    validateRequest(req, next, schema);
}

/***
 *
 * @param req
 * @param res
 * @param next
 */
function authenticate(req, res, next) {
    const { email, password } = req.body;
    const ipAddress = req.ip;
    userService.authenticate({ email, password, ipAddress })
        .then(({ refreshToken, ...user }) => {
            setTokenCookie(res, refreshToken);
            res.json(user);
        })
        .catch(next);
}

/***
 *
 * @param req
 * @param res
 * @param next
 */
function create(req, res, next) {
    const {fullName, email, role, password } = req.body;
    const user = new User({
        fullName,
        email,
        passwordHash: bcrypt.hashSync(password, 10),
        role,
        tsCreated: Date.now(),
        tsModified: Date.now(),
        modifiedBy: req.user.id,
        isActive: true
    });
    const meta = {};
    userService.create(user)
        .then(data => res.json({
            meta,
            data
        }))
        .catch(error => res.status(400).send({
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
    const {fullName, role} = req.body;

    userService.getById(id)
        .then(response => {
            const newUser = new User(response);
            newUser.fullName = fullName ? fullName : newUser.fullName;
            newUser.role = role ? role : newUser.role;
            newUser.tsModified = Date.now();
            newUser.modifiedBy = req.user.id;
            const meta = {};
            userService.update(id, newUser)
                .then(data => res.json({
                    meta,
                    data
                }))
                .catch(error => res.status(400).send({
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
function getAll(req, res, next) {
    const meta = {}
    userService.getAll()
        .then(data => {
            meta.total = data.length;
            res.json({
                meta,
                data
            })
        })
        .catch(error => res.status(400).send({
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
 * @returns {*}
 */
function getById(req, res, next) {
    // regular users can get their own record and admins can get any record
    if (req.params.id !== req.user.id && req.user.role !== Role.Admin) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    const meta = {
        id: req.params.id
    }
    userService.getById(req.params.id)
        .then(data => res.json({
            meta,
            data
        }))
        .catch(error => res.status(400).send({
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
function changePassword(req, res, next) {
    const { password, newPassword } = req.body;
    const meta = {};
    userService.changePassword(req.params.id, {password, newPassword})
        .then(data => res.json({
            meta,
            data
        }))
        .catch(error => res.status(400).send({
            meta,
            error: {
                message: error
            }
        }))
        .finally(next);
}

// helper functions

/***
 *
 * @param res
 * @param token
 */
function setTokenCookie(res, token)
{
    // create http only cookie with refresh token that expires in 7 days
    const cookieOptions = {
        httpOnly: true,
        expires: new Date(Date.now() + 7*24*60*60*1000)
    };
    res.cookie('refreshToken', token, cookieOptions);
}
