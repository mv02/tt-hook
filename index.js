const CDP = require('chrome-remote-interface');
const DiscordSender = require('./discord.js');
const ChatLogger = require('./chat.js');
const { options, loggers } = require('./config.json');

CDP(options)
.then(client => {
    console.log(`CDP:  Connected to ${options.tab}`);
    const discord = new DiscordSender(loggers);
    const chat = new ChatLogger(client.Runtime, discord, null);

    client.Runtime.bindingCalled(async event => {
        switch (event.name) {
            case 'utilsChatMessage':
                await chat.handleCall(event.payload);
                break;

            default:
                console.log(`Binding ${event.name} called`);
                break;
        }
    });

    client.once('disconnect', () => {
        chat.forceSend();
        console.log('CDP:  Disconnected');
    });

    for (let sig of ['SIGINT', 'SIGHUP']) {
        process.on(sig, () => {
            chat.forceSend()
            .then(() => process.exit());
        });
    }
})
.catch(err => console.error(`CDP:  ${err}`));
