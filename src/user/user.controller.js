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
router.post('/refresh-token', refreshToken);
router.post('/revoke-token', authorize(), revokeTokenSchema, revokeToken);
router.get('', authorize(Role.Admin), getAll);
router.get('/:id', authorize(Role.Admin), getById);
router.post('', authorize(Role.Admin), create);
router.put('/:id', authorize(Role.Admin), update);
router.put('/:id/reset-password', authorize(), changePassword)
router.get('/:id/refresh-tokens', authorize(), getRefreshTokens);

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
function refreshToken(req, res, next) {
    const token = req.cookies.refreshToken;
    const ipAddress = req.ip;
    userService.refreshToken({ token, ipAddress })
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
function revokeTokenSchema(req, res, next) {
    const schema = Joi.object({
        token: Joi.string().empty('')
    });
    validateRequest(req, next, schema);
}

/***
 *
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
function revokeToken(req, res, next) {
    // accept token from request body or cookie
    const token = req.body.token || req.cookies.refreshToken;
    const ipAddress = req.ip;

    if (!token) return res.status(400).json({ message: 'Token is required' });

    // users can revoke their own tokens and admins can revoke any tokens
    if (!req.user.ownsToken(token) && req.user.role !== Role.Admin) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    userService.revokeToken({ token, ipAddress })
        .then(() => res.json({ message: 'Token revoked' }))
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
    userService.create(user)
        .then(user => user ? res.json(user): res.status(422).send({error: "Failed to create user."}))
        .catch(next);
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

            userService.update(id, newUser)
                .then(user => user ? res.json(user): res.status(422).send({error: "Failed to update user."}))
                .catch(next);
        });
}

/***
 *
 * @param req
 * @param res
 * @param next
 */
function getAll(req, res, next) {
    userService.getAll()
        .then(users => res.json(users))
        .catch(next);
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

    userService.getById(req.params.id)
        .then(user => user ? res.json(user) : res.sendStatus(404))
        .catch(next);
}

/***
 *
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
function getRefreshTokens(req, res, next) {
    // users can get their own refresh tokens and admins can get any user's refresh tokens
    if (req.params.id !== req.user.id && req.user.role !== Role.Admin) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    userService.getRefreshTokens(req.params.id)
        .then(tokens => tokens ? res.json(tokens) : res.sendStatus(404))
        .catch(next);
}

/***
 *
 * @param req
 * @param res
 * @param next
 */
function changePassword(req, res, next) {
    const { password, newPassword } = req.body;

    userService.changePassword(req.params.id, {password, newPassword})
        .then( user => user ? res.json(user) : res.status(422).send({error: "Failed to update password."}))
        .catch(next);
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
