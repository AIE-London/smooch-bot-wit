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
  getSizeColour({context, entities}) {
    return new Promise(function(resolve, reject) {
      console.log(entities);
      var size = firstEntityValue(entities, 'size');
      var colour = firstEntityValue(entities, 'colour');

      if (size) {
        context.size = size;
        delete context.missingSize;
      }

      if (!context.size && !size) {
        context.missingSize = true;
      }

      if (colour) {
        context.colour = colour;
        delete context.missingColour;
      }

      if (!context.colour && !colour) {
        context.missingColour = true;
      }
      // We should call retail shop api to search for clothes (Amazon API)
      return resolve(context);
    });
  },
  getLocationDateClothes({context, entities}) {
    return new Promise(function(resolve, reject) {
      var location = firstEntityValue(entities, 'location');
      var datetime = firstEntityValue(entities, 'datetime');
      var clotheType = firstEntityValue(entities, 'clotheType');

      if (location) {
        context.location = location;
        delete context.missingLocation;
      }
      if (datetime) {
        context.datetime = datetime;
        delete context.missingDatetime;
      }
      if (clotheType) {
        context.clotheType = clotheType;
        delete context.missingClothesType;
      }

      if (!context.location && !location) {
        context.missingLocation = true;
      }
      if (!context.datetime && !datetime) {
        context.missingDatetime = true;
      }
      if (!context.clotheType && !clotheType) {
        context.missingClothesType = true;
      }

      if (location && datetime && clotheType) {
        delete context.missingLocation;
        delete context.missingClothesType;
        delete context.missingDatetime;
      }
      return resolve(context);
    });
  },
  getHistoricData({context, entities})
  {
	  // Retrieve information the customer has supplied previously
	  console.error('Called getHistoricData in actions.js');
	  return new Promise(function(resolve, reject) {
		context.BigNums = 'Big Values';
        console.error('Called getHistoricData in actions.js');
	    return resolve(context);
	  });
  }
};

module.exports = actions;
