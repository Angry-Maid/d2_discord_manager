const path = require('path');

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const monk = require('monk');
const Discord = require('discord.js');

require('dotenv').config();

const vueApp = path.join(__dirname, 'views');

const db = monk(process.env.MONGO_URI);
const guilds = db.get('guilds');
guilds.createIndex({ guildId: 1 }, { unique: true });

const categories = db.get('categories');
categories.createIndex({ categoryId: 1 }, { unique: true });

const channels = db.get('channels');
channels.createIndex({ channelId: 1 }, { unique: true });

const app = express();

app.use(helmet());
app.use(morgan('tiny'));
app.use(cors());
app.use(express.json());

const guildRoutes = require('./api/routes/guildRoutes');
guildRoutes(app);
const categoryRoutes = require('./api/routes/categoryRoutes');
categoryRoutes(app);

app.get('/', (req, res) => {
  res.sendFile(path.join(vueApp, 'index.html'));
});

const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
});

const client = new Discord.Client();

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
  console.log('Bot Servers:');
  client.guilds.cache.forEach((g) => {
    guilds.insert({
      guildName: g.name,
      guildId: g.id,
    }).catch(() => {});
    console.log(`\t${g.name} \\ ID ${g.id}`);

    const guildCategories = g.channels.cache.filter((channel) => channel.type === 'category');

    categories.insert(guildCategories.map((c) => Object({
      guildId: g.id,
      categoryId: c.id,
      categoryName: c.name,
      selected: false,
      userLimit: 0,
    }))).catch(() => {});
  });
});

// client.on('message', (_) => {});

client.on('voiceStateUpdate', (oldMember, newMember) => {
  const newUserChannel = newMember.channel;
  const oldUserChannel = oldMember.channel;

  const { member } = newMember;

  const name = member.user.username;

  if (oldUserChannel === null && newUserChannel !== null) {
    console.log(`${name} joined ${newUserChannel.parent.name}(${newUserChannel.name}) channel`);
    const newCategory = newUserChannel.parent;

    categories.findOne({ categoryId: newCategory.id }).then((e) => {
      if (e.selected) {
        newCategory.guild.channels.create(`${name}'s voice channel`, {
          type: 'voice',
          parent: e.categoryId,
        }).then((channel) => {
          channels.insert({
            channelId: channel.id,
          }).catch(() => {});

          if (e.userLimit > 0) {
            channel.setUserLimit(e.userLimit);
          }
          member.voice.setChannel(channel);
        }).catch((err) => {
          console.error(err);
        });
      }
    });
  } else if (oldUserChannel !== null && newUserChannel !== null) {
    console.log(`${name} switched channels from ${oldUserChannel.parent.name}(${oldUserChannel.name}) to ${newUserChannel.parent.name}(${newUserChannel.name})`);
    const newCategory = newUserChannel.parent;

    categories.findOne({ categoryId: newCategory.id }).then((e) => {
      if (e.selected) {
        channels.findOne({ channelId: newUserChannel.id }).then((entry, rejected) => {
          console.log(`${entry} ${rejected}`);
          if (!entry) {
            newCategory.guild.channels.create(`${name}'s voice channel`, {
              type: 'voice',
              parent: e.categoryId,
            }).then((channel) => {
              channels.insert({
                channelId: channel.id,
              }).catch(() => {});

              if (e.userLimit > 0) {
                channel.setUserLimit(e.userLimit);
              }
              member.voice.setChannel(channel);
            }).catch((err) => {
              console.error(err);
            });
          }
        });
      }
    });
  } else if (newUserChannel === null) {
    console.log(`${name} left ${oldUserChannel.parent.name}(${oldUserChannel.name}) channel`);
    // console.log(`${oldUserChannel.members.size}`);
  }
});

client.login(process.env.BOT_TOKEN);
