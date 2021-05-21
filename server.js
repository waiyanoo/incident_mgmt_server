require('rootpath')();
const os = require('os');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const errorHandler = require('src/_middleware/error-handler');
const userRoute = require('./src/user/user.controller');
const incidentRoute = require('./src/incident/incident.controller');

dotenv.config();

const createTestUser = require('./src/_helpers/create-test-user');
createTestUser();

// allow cors requests from any origin and with credentials
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors({ origin: (origin, callback) => callback(null, true), credentials: true }));


// api routes
app.use('/api/users', userRoute);

app.use('/api/incidents', incidentRoute);

app.get('/', function (req, res, next) {

    res.json({
        mess: 'hello it looks like you are on the whitelist',
        origin: req.headers.origin,
        os_hostname: os.hostname(),
        os_cpus: os.cpus()
    });

});

// global error handler
app.use(errorHandler);

// start server
const port = process.env.NODE_ENV === 'production' ? (process.env.PORT || 80) : 5000;
app.listen(port, () => {
    console.log('Server listening on port ' + port);
});
