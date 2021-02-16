const guilds = require('../controllers/guildController');

module.exports = (app) => {
  app
    .route('/guilds')
    .get(guilds.allGuilds);
};
