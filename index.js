require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');
const express = require('express');

// Express-Server für Heroku "Keep Alive"
const app = express();
app.get('/', (req, res) => res.send('Bot runs!'));
app.listen(process.env.PORT || 3000);

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

client.on('ready', () => {
  console.log(`Bot is online as ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  if (message.content.startsWith('!login')) {
    const args = message.content.split(' ');
    const username = args[1];
    const password = args[2];

    if (!username || !password) {
      message.reply('Please use: `!login <username> <password>`');
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
        console.log(token + "for username " + username);

      if(token == 'OFF')
      {
        await message.channel.send(`Wrong login-data!`);
      }
      else
      {
        const productsRes = await axios.get('https://bff-webprogrammierung-6322597a0426.herokuapp.com/api/wishlist?token=' + token);

      


      const products = productsRes.data;
      console.log(products);

        

      var count = 1;

      for (const product of products)
        {

        await message.channel.send(`${count}: ${product.title} with ${product.price} €`);
        count += 1;
      }
      }

    } catch (err) {
      console.error(err);
      message.reply('Error while logging in  or getting products of wishlist.');
    }
  }

});

client.login(process.env.DISCORD_BOT_TOKEN);