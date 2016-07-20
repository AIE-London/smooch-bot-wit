'use strict';

const SmoochCore = require('smooch-core');
const webhookTriggers = ['message:appUser', 'postback'];
const jwt = require('./jwt');
const config = require ('../../config');

function createWebhook(smoochCore, target) {
  return smoochCore.webhooks.create({
    target,
    triggers: webhookTriggers
  })
  .then((res) => {
    console.log('Smooch webhook created with target', res.webhook.target);
  })
  .catch((err) => {
    console.error('Error creating Smooch webhook:', err);
    console.error(err.stack);
  });
}

function updateWebhook(smoochCore, existingWebhook) {
  return smoochCore.webhooks.update(existingWebhook._id, {
    triggers: webhookTriggers
  })
  .then((res) => {
    console.log('Smooch webhook updated with missing triggers', res.webhook.target);
  })
  .catch((err) => {
    console.error('Error updating Smooch webhook:', err);
    console.error(err.stack);
  });
}

// Create a webhook if one doesn't already exist
function deployWebhook() {
  if (config.serviceUrl) {
    const target = config.serviceUrl.replace(/\/$/, '') + '/webhook';
    const smoochCore = new SmoochCore({
      jwt
    });
    smoochCore.webhooks.list()
    .then((res) => {
      const existingWebhook = res.webhooks.find((w) => w.target === target);

      if (!existingWebhook) {
        return createWebhook(smoochCore, target);
      }

      const hasAllTriggers = webhookTriggers.every((t) => {
        return existingWebhook.triggers.indexOf(t) !== -1;
      });

      if (!hasAllTriggers) {
        updateWebhook(smoochCore, existingWebhook);
      }
    });
  }
}

module.exports = { deployWebhook };
