require('dotenv').config();

const db = require('monk')(process.env.MONGO_URI);
const guilds = db.get('guilds');

exports.allGuilds = (req, res) => {
  guilds.find({}, (err, gds) => {
    if (err) res.send(err);
    res.json(gds);
  });
};
