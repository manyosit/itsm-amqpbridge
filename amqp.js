require('dotenv').config();
const log = require ('./logger.js');
const msgOptions =  process.env.MESSAGE_OPTIONS || {persistent: true};

const amqp = require('amqp-ts');
let connection = null;

function publishMessage(exchangeName, routingKey, messageText) {
    exchangeName = exchangeName || process.env.EXCHANGE || 'mys.soapgateway';
    routingKey = routingKey || process.env.ROUTINGKEY || 'mys.soapgateway.undefined';
    const exchangeType = process.env.EXCHANGE_TYPE || 'topic'

    log.debug ('connection status', connection.isConnected);

    log.debug ('setup exchange', exchangeName);
    const exchange = connection.declareExchange(exchangeName, exchangeType);

    log.debug('use routing', routingKey);
    log.debug ('send message', messageText);

    var msg = new amqp.Message(messageText, msgOptions);
    exchange.send(msg);
    log.debug ('message sent', msg);
}


function connect() {
    connection = new amqp.Connection("amqp://rabbitmq:rabbitmq@pier1");
}

module.exports = {
    publishMessage, connect
};