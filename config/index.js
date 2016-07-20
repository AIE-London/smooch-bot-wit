const config = {
  // Smooch.io
  smoochToken: process.env.SMOOCH_APP_TOKEN,
  smoochKeyId: process.env.SMOOCH_KEY_ID,
  smoochSecret: process.env.SMOOCH_SECRET,
  smoochBotName: process.env.SMOOCH_BOT_NAME || 'Smooch Bot',
  smoochAvatarUrl: process.env.SMOOCH_AVATAR || 'https://s.gravatar.com/avatar/f91b04087e0125153623a3778e819c0a?s=80',
  // Wit.ai
  witToken: process.env.WIT_TOKEN,
  witLogLevel: process.env.WIT_LOG_LEVEL || 'debug',
  // General settings
  serviceUrl: process.env.SERVICE_URL, // used to create the webhook in smooch.io
  port: process.env.PORT || 8000,
};

export default config;
