const CDP = require('chrome-remote-interface');
const axios = require('axios');
const fs = require('fs');
const { options, servers, customEmojis, webhook } = require('./config.json');

let server;

CDP(options, async (client) => {
  console.log('Connected!');

  client.Runtime.bindingCalled(event => {
    if (event.name == 'sendMessage') {
      let msg = event.payload;

      // nahrad emoji IDs discordovymi custom emojis
      for (let [key, value] of Object.entries(customEmojis)) {
        let regex = new RegExp(key, 'g');
        msg = msg.replace(regex, value);
      }

      // projdi vsechny URL http nebo https
      let urls = msg.match(/(http|https):\/\/[0-9a-z./-?&]*/gi) || [];
      for (let url of urls) {
        msg = msg.replace(url, '`' + url + '`');
      }

      axios.post(webhook, { content: `\`[${new Date().toLocaleTimeString('cs')}]\` \`[${server}]\` ${msg}` });
    }
    else if (event.name == 'sendServerAddress') {
      console.log('[Address received]', event.payload);
      server = servers[event.payload];
    }
  });

  await client.Runtime.addBinding({ name: 'sendServerAddress' }).then(console.log('Address binding created')).catch(e => console.log(e));
  await client.Runtime.addBinding({ name: 'sendMessage' }).then(console.log('Message binding created')).catch(e => console.log(e));

  await client.Runtime.evaluate({ expression: fs.readFileSync('./evaluate.js', 'utf-8') }).then(ret => console.log('Script evaluated', ret)).catch(e => console.log(e));
}).on('error', (err) => {
  console.error(err);
});