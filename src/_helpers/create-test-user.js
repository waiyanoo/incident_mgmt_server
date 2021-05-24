const bcrypt = require('bcryptjs');
const db = require('./db');
const Role = require('./role');

module.exports = createTestUser;

async function createTestUser() {
    // create test user if the db is empty
    if ((await db.User.countDocuments({})) === 0) {
        const user = new db.User(
        {
            fullName: 'User',
            email: 'user@mail.com',
            passwordHash: bcrypt.hashSync('P@ssword1', 10),
            role: Role.User,
            isActive: true,
            tsCreated: new Date(),
            tsModified: new Date(),
            modifiedBy: 'System'
        });
        await user.save();
        const admin = new db.User(
            {
                fullName: 'Admin',
                email: 'admin@mail.com',
                passwordHash: bcrypt.hashSync('P@ssword1', 10),
                role: Role.Admin,
                isActive: true,
                tsCreated: new Date(),
                tsModified: new Date(),
                modifiedBy: 'System'
            });
        await admin.save();
    }
}
