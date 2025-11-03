/*require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');
const express = require('express');

// Express-Server für Heroku "Keep Alive"
const app = express();
app.get('/', (req, res) => res.send('Bot läuft!'));
app.listen(process.env.PORT || 3000);

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

client.on('ready', () => {
  console.log(`Bot ist online als ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  if (message.content.startsWith('!login')) {
    const args = message.content.split(' ');
    const username = args[1];
    const password = args[2];

    if (!username || !password) {
      message.reply('Bitte nutze: `!login <username> <password>`');
      return;
    }

    try {
      
       
const loginRes = await axios.post(
  'https://bff-webprogrammierung-6322597a0426.herokuapp.com/api/login?username='+ username + '&password=' + password,
  {
    username,
    password
  },
  {
    headers: {
      'Content-Type': 'application/json'
    }
  }
);


        const token = loginRes.data.token;
        console.log(token);

      const productsRes = await axios.get('https://bff-webprogrammierung-6322597a0426.herokuapp.com/api/wishlist?token=' + token);

      
      const products = productsRes.data;
      console.log(products);

      for (const product of products) {
        var count = 1;
        await message.channel.send(`${count}: ${product.title} with ${product.price} €`);
      }

    } catch (err) {
      console.error(err);
      message.reply('Fehler beim Login oder beim Abrufen der Produkte.');
    }
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);*/

const userTokens = new Map();

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  const args = message.content.split(' ');

  if (message.content.startsWith('!login')) {
    const username = args[1];
    const password = args[2];

    if (!username || !password) {
      message.reply('Bitte nutze: `!login <username> <password>`');
      return;
    }

    try {
      const loginRes = await axios.post(
        'https://bff-webprogrammierung-6322597a0426.herokuapp.com/api/login?username='+ username + '&password=' + password,
        { username, password },
        { headers: { 'Content-Type': 'application/json' } }
      );

      const token = loginRes.data.token;
      userTokens.set(message.author.id, token); // Speichere Token für den User

      message.reply('Login erfolgreich! Du kannst jetzt `!wishlist` verwenden.');
    } catch (err) {
      console.error(err);
      message.reply('Login fehlgeschlagen.');
    }
  }

  if (message.content.startsWith('!wishlist')) {
    const token = userTokens.get(message.author.id);

    if (!token) {
      message.reply('❗ Du musst dich zuerst mit `!login <username> <password>` einloggen.');
      return;
    }

    try {
      const productsRes = await axios.get(
        'https://bff-webprogrammierung-6322597a0426.herokuapp.com/api/wishlist?token='+ token,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const products = productsRes.data;
      let count = 1;
      for (const product of products) {
        await message.channel.send(`${count}: ${product.title} with ${product.price} €`);
        count++;
      }
    } catch (err) {
      console.error(err);
      message.reply('Fehler beim Abrufen der Produkte.');
    }
  }
});