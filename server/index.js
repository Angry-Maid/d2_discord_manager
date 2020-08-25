const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const monk = require('monk');
const Discord = require('discord.js');

require('dotenv').config();

const db = monk(process.env.MONGO_URI);
const users = db.get('users');
const config = db.get('config');
const logs = db.get('logs');

const app = express();

app.use(helmet());
app.use(morgan('tiny'));
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    message: 'None',
  });
});

const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
});

const client = new Discord.Client();

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.login(process.env.BOT_TOKEN);
