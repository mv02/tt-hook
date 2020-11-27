const CDP = require('chrome-remote-interface');
const axios = require('axios');
const fs = require('fs');
const { options, customEmojis, webhook } = require('./config.json');

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

      axios.post(webhook, { content: `\`[${new Date().toLocaleTimeString('cs')}]\` ${msg}` });
    }
  });

  await client.Runtime.addBinding({ name: 'sendMessage' }).then(console.log('Message binding created')).catch(e => console.log(e));

  await client.Runtime.evaluate({ expression: fs.readFileSync('./evaluate.js', 'utf-8') }).then(ret => console.log('Script evaluated', ret)).catch(e => console.log(e));
}).on('error', (err) => {
  console.error(err);
});