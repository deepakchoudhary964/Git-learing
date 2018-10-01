const winston = require('winston');
winston.add(
    winston.transports.File, {
        filename: './logs/error.log',
        level: 'error',
        json: false,
        eol: '\n', // for Windows, or `eol: ‘n’,` for *NIX OSs
        timestamp: true
    }
);

module.exports = winston;