const CDP = require('chrome-remote-interface');
const axios = require('axios');
const fs = require('fs');
const { options, servers, customEmojis, webhook } = require('./config.json');
const emojiRegex = require('emoji-regex/RGI_Emoji.js');

let server;

CDP(options, async (client) => {
  console.log('Connected!');
  axios.post(webhook, { content: '**Listening for messages!**' });

  client.on('disconnect', () => {
    console.log('Disconnected!');
    axios.post(webhook, { content: '**Disconnected.**' });
  });

  client.Runtime.bindingCalled(event => {
    if (event.name == 'sendMessage') formatAndSend(event.payload);
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

function formatAndSend(raw) {
  let msg = raw;

  // odstran color kody ^1 ^2...
  msg = msg.replace(/\^[0-9a-z*]/g, '');
  // odstran \s s\, \a a\, \r r\ u emojis ID
  msg = msg.replace(/\\[a-z!]/g, '').replace(/[a-z!]\\/g, '');

  // escapni normalni emoji v prefixu a jmene - win10 namisto discordovych
  let emojis = [...new Set(msg.split(':')[0].match(emojiRegex()) || [])];
  for (let emoji of emojis) {
    let regex = new RegExp(emoji, 'g');
    msg = msg.replace(regex, '\\' + emoji);
  }

  // nahrad emoji IDs discordovymi custom emojis
  for (let [key, value] of Object.entries(customEmojis)) {
    let regex = new RegExp(key, 'g');
    msg = msg.replace(regex, value);
  }

  // projdi vsechny URL http nebo https
  let urls = msg.match(/(http|https):\/\/[0-9a-z./-?&]*/gi) || [];
  for (let url of urls) {
    // emoji obrazek - nahrad Unicode kodem
    if (url.startsWith('https://github.githubassets.com/images/icons/emoji/unicode')) {
      let code = url.match(/\w*\.png/g)[0].replace('.png', '');
      msg = msg.replace(url, String.fromCodePoint('0x' + code));
    }
    // bezna URL - dej do codeblocku aby neslo klikat
    else msg = msg.replace(url, '`' + url + '`');
  }

  console.log('[Message]', msg);
  axios.post(webhook, { content: `\`[${new Date().toLocaleTimeString('cs')}]\` \`[${server}]\` ${msg}` });
}
