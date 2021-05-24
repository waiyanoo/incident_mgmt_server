const config = require('../../config');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('src/_helpers/db');
const { User } = require('../_helpers/db');

module.exports = {
    authenticate,
    getAll,
    getById,
    create,
    update,
    changePassword
};

/***
 *
 * @param data : User
 * @returns {Promise<User>}
 */
async function create(data) {
    try{
        const user = new db.User(data);
        await user.save();
        return user;
    }
    catch (e) {
        throw 'User create failed'
    }
}

/***
 *
 * @param id : string
 * @param data
 * @returns {Promise<User>}
 */
async function update(id, data) {
    try{
        const filter = { _id: id };
        const update = updateModel(data);
        let doc;
        doc = await db.User.findOneAndUpdate(filter, update, {
            new: true
        });
        return new User(doc);
    }
    catch (e) {
        throw 'User update failed.'
    }
}

/***
 *
 * @param id : string
 * @param data
 * @returns {Promise<User>}
 */
async function changePassword(id, data) {
    const user = await db.User.findById(id);

    if (!user || !bcrypt.compareSync(data.password, user.passwordHash)) {
        throw 'Password is incorrect';
    }

    user.passwordHash = bcrypt.hashSync(data.newPassword, 10);

    const filter = { _id: id };
    const updateData = passwordModel(user);
    let doc;

    try{
        doc = await db.User.findOneAndUpdate(filter, updateData, {
            new: true
        });
    }
    catch (e) {
        throw 'User update failed.'
    }
    return new User(doc);
}

/***
 *
 * @param email : string
 * @param password : string
 * @param ipAddress : string
 * @returns {Promise<{role: *, fullName: *, jwtToken: (*), id: *, email: *, refreshToken: *}>}
 */
async function authenticate({ email, password, ipAddress }) {
    const user = await db.User.findOne({ email });
    if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
        throw 'Email or password is incorrect';
    }

    // authentication successful so generate jwt and refresh tokens
    const token = generateJwtToken(user);

    return {
        ...basicDetails(user),
        token
    };
}

/***
 *
 * @returns {Promise<Query<Array<EnforceDocument<User>>, Document<User>, {}>>}
 */
async function getAll() {
    try{
        return await db.User.find();
    }catch (e) {
        console.log(e);
        throw 'Failed to retrieve users'
    }

}

/***
 *
 * @param id : string
 * @returns {Promise<User>}
 */
async function getById(id) {
    try{
        return await getUser(id);
    }catch (e) {
        console.log(e);
        throw 'Failed to retrieve user'
    }
}

/***
 *
 * @param id : string
 * @returns {Promise<User>}
 */
async function getUser(id) {
    // check that user exists
    if (!db.isValidId(id)) throw 'User not found';
    // search user by Id
    const user = await db.User.findById(id);
    if (!user) throw 'User not found';
    return user;
}

/***
 *
 * @param user : User
 * @returns {*}
 */
function generateJwtToken(user) {
    // return a jwt token that is valid for 1 days
    return jwt.sign({ sub: user.id, id: user.id }, config.secret, { expiresIn: '1d' });
}

/***
 *
 * @param user
 * @returns {{role, fullName, id, email}}
 */
function basicDetails(user) {
    const { id, fullName , email, role} = user;
    return { id, fullName , email, role};
}

/***
 *
 * @param user
 * @returns {{role, tsModified, name, fullName, modifiedBy, isActive}}
 */
function updateModel(user) {
    const { fullName, role, tsModified, isActive, modifiedBy} = user;
    return { fullName, role, tsModified, isActive, modifiedBy};
}

/***
 *
 * @param user
 * @returns {{tsModified, modifiedBy, passwordHash}}
 */
function passwordModel(user) {
    const { passwordHash, tsModified, modifiedBy} = user;
    return { passwordHash, tsModified, modifiedBy};
}
