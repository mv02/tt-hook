const CDP = require('chrome-remote-interface');
const DiscordSender = require('./discord.js');
const { options, loggers } = require('./config.json');

CDP(options)
.then(async client => {
    console.log(`CDP:  Connected to ${options.tab}`);
    const discord = new DiscordSender(loggers);

    client.Runtime.bindingCalled(event => {
        switch (event.name) {
            default:
                console.log(`Binding ${event.name} called`);
                break;
        }
    });

    client.once('disconnect', () => console.log('CDP:  Disconnected'));
})
.catch(err => console.error(`CDP:  ${err}`));
