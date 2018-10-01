require('dotenv').load();
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const models = path.join(__dirname, 'app/models');
const config = require('./config');
const port = process.env.PORT || 3000;
const morgan = require('morgan');
const logger = require('./config/logger');
const cors = require('cors');
const app = express();

fs.readdirSync(models)
    .filter(file => ~file.search(/^[^\.].*\.js$/))
    .forEach(file => require(path.join(models, file)));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

app.use(morgan('combined', {
    stream: fs.createWriteStream(path.join(__dirname, './logs/access.log'), {flags: 'a'})
}));

require('./config/routes')(app);
app.use(function (req, res, next) {
    res.status(404).send({error: "Not found"});

});

app.use((err, req, res, next) => {
    logger.error(err.toString());
    return res.status(500).send({error: err.toString()});
});

mongoose.Promise = require('bluebird');
mongoose.connect(config.db, {
    useMongoClient: true
});
mongoose.connection
    .on('error', console.error.bind(console, 'MongoDB connection error:'))
    .on('open', listen);

function listen() {
    if (app.get('env') === 'test') return;
    app.listen(port);
    console.log('Express app started on port ' + port);
}