const config = require('../../config');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

const connectionOptions = { useCreateIndex: true, useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false };

dotenv.config();

mongoose.connect(process.env.MONGODB_URI || config.connectionString, connectionOptions);
mongoose.Promise = global.Promise;

module.exports = {
    User: require('src/user/user.model'),
    RefreshToken: require('src/user/refresh-token.model'),
    Incident: require('src/incident/incident.model'),
    isValidId
};

function isValidId(id) {
    return mongoose.Types.ObjectId.isValid(id);
}
