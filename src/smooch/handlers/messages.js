const sessions = require('../../wit/sessions').sessions;
const findOrCreateSession = require('../../wit/sessions').findOrCreateSession;
const wit = require('../../wit/init');

// Message handler
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

module.exports = handleMessages;
