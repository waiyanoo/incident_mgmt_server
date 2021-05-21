require('rootpath')();
const express = require('express');
const app = express();
os = require('os');
const dotenv = require('dotenv');

dotenv.config();

const createTestUser = require('./src/_helpers/create-test-user');
createTestUser();


// start server
const port = process.env.NODE_ENV === 'production' ? (process.env.PORT || 80) : 5000;
app.listen(port, () => {
    console.log('Server listening on port ' + port);
});
