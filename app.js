/*jslint node: true */
"use strict";

require('dotenv').config();
const log = require ('./logger.js');

const mq = require('./amqp.js');

var soap = require('soap');
var express = require('express');
var fs = require('fs');

// the splitter function, used by the service
function send2queue_function(args) {
    log.debug('send2queue_function', args);
    mq.publishMessage(args.exchange, args.routingKey, args.message);
    return {
        status: "success",
        message: "alles gut"
    }
}

// the service
var serviceObject = {
    MessageQueueService: {
        MessageQueueServiceSoapPort: {
            MessageQueue: send2queue_function
        },
        MessageQueueServiceSoap12Port: {
            MessageQueue: send2queue_function
        }
    }
};

// load the WSDL file
var xml = fs.readFileSync('service.wsdl', 'utf8');
// create express app
var app = express();

// root handler
app.get('/', function (req, res) {
    console.log('sd');
    res.send('Node Soap Example!<br /><a href="https://github.com/macogala/node-soap-example#readme">Git README</a>');
});

// Launch the server and listen
var port = 3000;
app.listen(port, function () {
    console.log('Listening on port ' + port);
    var wsdl_path = "/wsdl";
    soap.listen(app, wsdl_path, serviceObject, xml);
    soap.log = function(type, data) {
        log.debug(data);
    };
    console.log("Check http://localhost:" + port + wsdl_path +"?wsdl to see if the service is working");
});

mq.connect();

/*setTimeout(function() {
    mq.publishMessage('sda','adsd', 'ads');
    //connection.close();
    //process.exit(0)
}, 1000);*/

