'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const path = require('path');
const request = require('request');
const config = require('./config');

// include smooch webhooks.
require('./src/smooch/webhooks').deployWebhook();

const handlePostback = require('./src/smooch/handlers/postback');
const handleMessages = require('./src/smooch/handlers/messages');

// Starting our webserver and putting it all together
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.use(bodyParser.json());

// Default handler for the web page.
app.get('/', function(req, res) {
  res.render('index', {
    appToken: config.smoochToken,
  });
});

// Logs requests to the console
app.use(({method, url}, rsp, next) => {
  rsp.on('finish', () => {
    console.log(`${rsp.statusCode} ${method} ${url}`);
  });
  next();
});
app.use(bodyParser.json());

// Webhook handler
app.post('/webhook', (req, res) => {
  // really basic security check on the webhook.
  if (!req.get('x-api-key')) {
    res.status(401).end();
    return;
  }

  const trigger = req.body.trigger;

  switch (trigger) {
    case 'message:appUser':
      handleMessages(req, res);
      break;

    case 'postback':
      handlePostback(req, res);
      break;

    default:
      console.log('Ignoring unknown webhook trigger:', trigger);
  }
});

const PORT = config.port;
app.listen(PORT);
console.log('Listening on :' + PORT + '...');
