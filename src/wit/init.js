const config = require('../../config');
const WIT_TOKEN = config.witToken;
const actions = require('./actions');
const sessions = require('./sessions').sessions;
const findOrCreateSession = require('./sessions').findOrCreateSession;

// ----------------------------------------------------------------------------
// Wit.ai bot specific code

// This will contain all user sessions.
// Each session has an entry:
// sessionId -> {userId: userId, context: sessionState}

// Wit.ai parameters
let Wit = require('../../lib/wit/wit').Wit;
let log = require('../../lib/wit/log');

const wit = new Wit({
  accessToken: WIT_TOKEN,
  actions,
  logger: new log.Logger(config.witLogLevel)
});

module.exports = wit;
