require('dotenv').config();
const bunyan = require('bunyan');

const log = bunyan.createLogger({
    name: 'itsm-soapgateway',
    stream: process.stdout,
    level: process.env.LOGLEVEL || 'error'
});

log.info ('Created logger', log);

module.exports = log;