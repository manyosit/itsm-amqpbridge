require('dotenv').config();
const log = require ('./logger.js');
const msgOptions =  process.env.MESSAGE_OPTIONS || {persistent: true};

const amqp = require('amqp-connection-manager');
let connection = null;
let channelWrapper = null;

const events = require('events');
const eventEmitter = new events.EventEmitter();


let timeoutCounter = 0;
const maxHeartbeat = 10;

function publishMessage(exchangeName, routingKey, message) {
    exchangeName = exchangeName || process.env.EXCHANGE || 'mys.soapgateway';
    routingKey = routingKey || process.env.ROUTINGKEY || 'mys.soapgateway.undefined';
    const exchangeType = process.env.EXCHANGE_TYPE || 'topic'

    log.debug ('setup exchange', exchangeName);

    //channelWrapper.assertExchange(exchangeName, exchangeType);
    //channelWrapper.bind()

    log.debug('queueLength', channelWrapper.queueLength());
    log.debug('connStatus', connection.isConnected());
    log.debug('use routing', routingKey);
    log.debug('send message', message);

    return new Promise(function(resolve, reject) {
        channelWrapper.addSetup(function(channel) {
            return Promise.all([
                channel.assertExchange(exchangeName, exchangeType, {})
            ])
        }).then(function () {
            if (!connection.isConnected()) {
                reject('MQ Server not connected');
            } else {
                resolve(channelWrapper.publish(exchangeName, routingKey, message, msgOptions));
            }
        }).catch(error => {
            reject('exchange not ready', exchangeName, error);
        });
    });
}

function handleMessage(message) {
    log.debug ('incomming', message);
}

function connect() {

    connection = new amqp.connect(process.env.MQ_CONNECTION);
    // Ask the connection manager for a ChannelWrapper.  Specify a setup function to
    // run every time we reconnect to the broker.
    channelWrapper = connection.createChannel({
        json: true,
        setup: function(channel) {
            // `channel` here is a regular amqplib `ConfirmChannel`.
            // Note that `this` here is the channelWrapper instance.
            //return channel.assertQueue('rxQueueName', {durable: true});
        }
    });

    connection.on('connect', ( err ) => {
        log.debug('connect', err);
        timeoutCounter = 0;
    });
    connection.on('disconnect', ( err ) => {
        log.error('disconnect', err);
    });

}

setInterval(function() {
    log.debug('heartbeat', timeoutCounter);
    if (connection != null) {
        if (connection.isConnected()) {
            timeoutCounter = 0;
        } else {
            timeoutCounter++;
        }
        if (timeoutCounter > maxHeartbeat) {
            log.info('Try to reconnect');
            connection.close();
            connect();
            //process.exit(0)
        }
    }

}, 5000);


module.exports = {
    publishMessage, connect
};