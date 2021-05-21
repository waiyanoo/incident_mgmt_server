const bcrypt = require('bcryptjs');
const db = require('./db');
const Role = require('./role');

module.exports = createTestUser;

async function createTestUser() {
    // create test user if the db is empty
    if ((await db.User.countDocuments({})) === 0) {
        const user = new db.User({
            fullName: 'Demo',
            username: 'Admin',
            email: 'admin@mail.com',
            passwordHash: bcrypt.hashSync('admin', 10),
            role: Role.Admin,
            isActive: true,
            tsCreated: new Date(),
            tsModified: new Date(),
            modifiedBy: ''
        });
        await user.save();
    }
}
