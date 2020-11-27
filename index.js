const CDP = require('chrome-remote-interface');
const axios = require('axios');
const { options, webhook } = require('./config.json');
const script = `
document.querySelector('body iframe[name=chat]').contentWindow.addEventListener('message', event => {
  if (event.data.type == 'ON_MESSAGE') {
      let msgObject = event.data.message;
      console.log('Message received:', msgObject.channel, msgObject.args);
      let msg;

      if (msgObject.channel.includes('chat')) msg = '**' + msgObject.args[0] + msgObject.args[2] + msgObject.args[3] + '**: ' + msgObject.args[1];
      else if (msgObject.channel.includes('system')) msg = msgObject.args[0];
      else msg = msgObject.args.join(' ');

      sendMessage(msg);
  }
  else console.log(event.data.type, 'event');
});`;

CDP(options, async (client) => {
  console.log('Connected!');

  client.Runtime.bindingCalled(event => {
    if (event.name == 'sendMessage') {
      axios.post(webhook, { content: `\`[${new Date().toLocaleTimeString('cs')}]\` ${event.payload}` });
    }
  });

  await client.Runtime.addBinding({ name: 'sendMessage' }).then(console.log('Message binding created')).catch(e => console.log(e));

  await client.Runtime.evaluate({ expression: script }).then(ret => console.log('Script evaluated', ret)).catch(e => console.log(e));
}).on('error', (err) => {
  console.error(err);
});