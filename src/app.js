//dotenv
require('dotenv').config();
const express = require('express');
var path = require('path');
const helmet  = require('helmet');
const bodyParser = require('body-parser');
const cors = require('cors');
const logger = require('morgan');
const http = require('http');
const wagner = require('wagner-core');
const config = require('config');



wagner.factory('config', config)
const app = express();

const port = config.get('BACKEND_PORT') || 8000;

// using bodyParser to parse JSON bodies into JS objects
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, 'public')));

// adding Helmet to enhance API's security
app.use(helmet());

// enabling CORS for all requests
app.use(cors());

//Models
const sequelize = require('./utils/db')(wagner);

require("./models")(sequelize, wagner);

require('./managers')(wagner);
//app.use(logger('config'));

require('./utils/dependencies')(wagner);
//Routes
require("./routes/v1")(app, wagner);


// Log requests to the console.
app.use(logger('development'));

//server.listen(port);
app.listen(port, () => console.log(`App listening on port ${port}!`));

module.exports = app;
