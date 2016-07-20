const config = require('../../config');
const smoochBot = require('smooch-bot');
const MemoryLock = smoochBot.MemoryLock;
const SmoochApiStore = smoochBot.SmoochApiStore;
const SmoochApiBot = smoochBot.SmoochApiBot;
const SmoochCore = require('smooch-core');
const jwt = require('./jwt');

const name = config.smoochBotName;
const avatarUrl = config.smoochAvatarUrl;
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

module.exports = { createBot }
