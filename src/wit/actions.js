const createBot = require('../smooch/bot').createBot;

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

module.exports = actions;
