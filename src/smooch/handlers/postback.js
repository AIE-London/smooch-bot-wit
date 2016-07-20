const createBot = require('../bot').createBot;

function handlePostback(req, res) {
  const postback = req.body.postbacks[0];
  if (!postback || !postback.action) {
    res.end();
  }

  createBot(req.body.appUser).say(`You said: ${postback.action.text} (payload was: ${postback.action.payload})`)
    .then(() => res.end());
}

module.exports = handlePostback;
