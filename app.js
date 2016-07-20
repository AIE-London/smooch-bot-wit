'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const path = require('path');
const request = require('request');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.use(bodyParser.json());

app.get('/', function(req, res) {
  res.render('index', {
    appToken: process.env.SMOOCH_APP_TOKEN
  });
});

let Wit = require('./lib/wit.js').Wit;
let log = require('./lib/log.js');

// include webhooks.
require('./lib/smooch-webhooks.js');

// ----------------------------------------------------------------------------
// Smooch bot specific code
const smoochBot = require('smooch-bot');
const MemoryLock = smoochBot.MemoryLock;
const SmoochApiStore = smoochBot.SmoochApiStore;
const SmoochApiBot = smoochBot.SmoochApiBot;
const SmoochCore = require('smooch-core');
const jwt = require('./jwt');

const name = 'Loyalty Bot';
const avatarUrl = 'https://s.gravatar.com/avatar/f91b04087e0125153623a3778e819c0a?s=80';
const store = new SmoochApiStore({
  jwt
});
const lock = new MemoryLock();

function createBot(appUser) {
  const userId = appUser.userId || appUser._id;
  return new SmoochApiBot({
    name,
    avatarUrl,
    lock,
    store,
    userId
  });
}

// ----------------------------------------------------------------------------
// Wit.ai bot specific code

// This will contain all user sessions.
// Each session has an entry:
// sessionId -> {userId: userId, context: sessionState}

// Wit.ai parameters
const WIT_TOKEN = process.env.WIT_TOKEN;

// setup wit actions
const firstEntityValue = (entities, entity) => {
  const val = entities && entities[entity] &&
    Array.isArray(entities[entity]) &&
    entities[entity].length > 0 &&
    entities[entity][0].value
  ;
  if (!val) {
    return null;
  }
  return typeof val === 'object' ? val.value : val;
};

// actions
const actions = {
  send(request, response, res, appUser) {
    const {sessionId, context, entities} = request;
    const {text, quickreplies} = response;
    return new Promise(function(resolve, reject) {
      // Instantiate the smooch bot and respond with the result.
      createBot(appUser).say(text)
         .then(() => res.end())
         .catch((err) => {
           console.error('SmoochBot error:', err);
           console.error(err.stack);
           res.end();
         });
      return resolve();
    });
  },
  getForecast({context, entities}) {
    return new Promise(function(resolve, reject) {
      var location = firstEntityValue(entities, 'location')
      if (location) {
        context.forecast = 'sunny in ' + location; // we should call a weather API here
        delete context.missingLocation;
      } else {
        context.missingLocation = true;
        delete context.forecast;
      }
      return resolve(context);
    });
  },
};

// setup wit
const wit = new Wit({
  accessToken: WIT_TOKEN,
  actions,
  //logger: new log.Logger(log.DEBUG)
});

const sessions = {};

const findOrCreateSession = (userId) => {
  let sessionId;
  // Let's see if we already have a session for the user userId
  Object.keys(sessions).forEach(k => {
    if (sessions[k].userId === userId) {
      // Yep, got it!
      sessionId = k;
    }
  });
  if (!sessionId) {
    // No session found for user userId, let's create a new one
    sessionId = new Date().toISOString();
    sessions[sessionId] = {userId: userId, context: {}};
  }
  return sessionId;
};

// ----------------------------------------------------------------------------
// webhook handlers
//
function handleMessages(req, res) {
  const { appUser } = req.body;
  const messages = req.body.messages.reduce((prev, current) => {
    if (current.role === 'appUser') {
        prev.push(current);
    }
    return prev;
  }, []);

  if (messages.length === 0) {
    return res.end();
  }

  // We retrieve the user ID of the sender
  const userId = appUser.userId || appUser._id;
  const message = messages[0].text;

  // We retrieve the user's current session, or create one if it doesn't exist
  // This is needed for our bot to figure out the conversation history
  const sessionId = findOrCreateSession(userId);

  if (message) {
    // We received a message

    // Let's forward the message to the Wit.ai Bot Engine
    // This will run all actions until our bot has nothing left to do
    wit.runActions(
      sessionId, // the user's current session
      message, // the user's message
      sessions[sessionId].context,  // the user's current session state
      res, // the response object
      appUser // the appUser from smooch
    ).then((context) => {
      // Our bot did everything it has to do.
      // Now it's waiting for further messages to proceed.
      console.log('Waiting for next user messages');

      // Based on the session state, you might want to reset the session.
      // This depends heavily on the business logic of your bot.
      // Example:
      // if (context['done']) {
      //   delete sessions[sessionId];
      // }

      // Updating the user's current session state
      sessions[sessionId].context = context;
    })
    .catch((err) => {
      console.error('Oops! Got an error from Wit: ', err.stack || err);
    })
  }
}

function handlePostback(req, res) {
  const postback = req.body.postbacks[0];
  if (!postback || !postback.action) {
    res.end();
  }

  createBot(req.body.appUser).say(`You said: ${postback.action.text} (payload was: ${postback.action.payload})`)
    .then(() => res.end());
}

// Webserver parameter
const PORT = process.env.VCAP_APP_PORT || 8445;

// Starting our webserver and putting it all together
app.use(({method, url}, rsp, next) => {
  rsp.on('finish', () => {
    console.log(`${rsp.statusCode} ${method} ${url}`);
  });
  next();
});
app.use(bodyParser.json());

// Message handler
app.post('/webhook', (req, res) => {
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

app.listen(PORT);
console.log('Listening on :' + PORT + '...');
