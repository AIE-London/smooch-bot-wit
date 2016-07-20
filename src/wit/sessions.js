const sessions = {}
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

module.exports = { sessions, findOrCreateSession };
