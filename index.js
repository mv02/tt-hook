const CDP = require('chrome-remote-interface');
const axios = require('axios');
const fs = require('fs');
const { options, webhook } = require('./config.json');

CDP(options, async (client) => {
  console.log('Connected!');

  client.Runtime.bindingCalled(event => {
    if (event.name == 'sendMessage') {
      axios.post(webhook, { content: `\`[${new Date().toLocaleTimeString('cs')}]\` ${event.payload}` });
    }
  });

  await client.Runtime.addBinding({ name: 'sendMessage' }).then(console.log('Message binding created')).catch(e => console.log(e));

  await client.Runtime.evaluate({ expression: fs.readFileSync('./evaluate.js', 'utf-8') }).then(ret => console.log('Script evaluated', ret)).catch(e => console.log(e));
}).on('error', (err) => {
  console.error(err);
});