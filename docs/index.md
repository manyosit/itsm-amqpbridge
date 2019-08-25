---
layout: page
title: AMQP-Bridge documention
subtitle: Learn how to send messages from your BMC ITSM Applications to AMQP Brokers 
use-site-title: true
bigimg: /img/bg-bridge.jpg
---

Bridge to create messages in an AMQP Broker (e.g. RabbitMQ) from BMC Remedy.

Table of Content

* TOC
{:toc}

# Introduction

Our bridge allows you to create messages in AMQP Broker via filter workflow. It provides a SOAP-Endpoint that can be addressed.

![architecture](img/architecture.png)

The api listens on port 3000.

WSDL-Url: http://yourhost:3000/wsdl?wsdl

Endpoint-Url: http://yourhost:3000/wsdl

{: .box-warning}
**Warning:** The bridge does currently not provide authentication for incomming requests. You should ensure on network/firewall level that it can only be reached from the AR System server.

# Deployment

The easiest deployment option is via docker.

{% highlight yaml linenos %}
version: '3.4' 
services: 
  node: 
    image: manyos/itsm-amqpbridge
    restart: always
    environment:
      - LOGLEVEL=info
      - MQ_CONNECTION=amqp://rabbitmq:8fdsu82@rabbitserver
{% endhighlight %}

# Configuration

The following Environment Variables can be used to change the behaviour of the Monitor API. 

| parameter|sample|description|default|
|---|---|---|---|
|MQ-CONNECTION|amqp://rabbitmq:dffds3id@pier1|Connectionstring with user and password for the AMQP Broker||
|LOGLEVEL|debug|Loglevel of the API. Use debug, info or error|error|
|MESSAGE_OPTIONS|{persistent: false}|Message options used to send new messages|{persistent: true}|
|EXCHANGE|remedy|Exchange where messages are sent to|mys.soapgateway|
|EXCHANGE_TYPE|fanout|Type of the exchange|topic|
|ROUTINGKEY|events.remedy|Routing key that is provided with all sent messages|mys.soapgateway.undefined|

# Send a message

You can send a message with a **Set Fields** filter action. You can provide values for *exchange*, *routingKey* and *message*. Only *message* is required.

![set fields](img/set-fields.png)

# Sample Workflow

The following sample workflow adds a new form and 3 filter to your system. The filter *MYS:SoapGW_PrepareMessage* creates a soap message from some form fields. The message is stored in the field *mqMessage*. The filter *MYS:SoapGW_Call* tries to send the message. Errors are handled with the filter *MYS:SoapGW_ErrorHandler*. This ensures that your transaction does not fail. In case of an error the field *mqResponseStatus* is set to error and *mqResponse* will have the error details in it.
  
* [amqpbridge-sample.def](sample/amqpbridge-sample.def)

{: .box-note}
**Note:** You need to change the endpoint address in the filter *MYS:SoapGW_Call* before you can use the sample workflow.

# Known issues

The way remedy deals with Webservices can cause messages to be published twice on the exchange.

The behaviour is described here <https://communities.bmc.com/docs/DOC-48090>

You can fix it if you change the *soapsequence* setting to either *Soap11-Only* or *Soap21-Only*.