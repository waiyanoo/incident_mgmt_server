const jwt = require('express-jwt');
const { secret } = require('../../config');
const dotenv = require('dotenv');
const db = require('src/_helpers/db');

module.exports = authorize;

dotenv.config();

/***
 *
 * @param roles
 * @returns {((function(*=, *=, *): (*|undefined))|*|(function(*, *, *): Promise<*|undefined>))[]}
 */
function authorize(roles = []) {
    // roles param can be a single role string (e.g. Role.User or 'User')
    // or an array of roles (e.g. [Role.Admin, Role.User] or ['Admin', 'User'])
    if (typeof roles === 'string') {
        roles = [roles];
    }
    const auth_secrect = process.env.AUTH_SECRECT ? process.env.AUTH_SECRECT : secret;
    return [
        // authenticate JWT token and attach user to request object (req.user)
        jwt({ secret: auth_secrect, algorithms: ['HS256'] }),
        // authorize based on user role
        async (req, res, next) => {
            const user = await db.User.findById(req.user.id);

            if (!user || (roles.length && !roles.includes(user.role))) {
                // user no longer exists or role not authorized
                return res.status(401).json({ message: 'Unauthorized' });
            }

            // authentication and authorization successful
            req.user.role = user.role;
            next();
        }
    ];
}
