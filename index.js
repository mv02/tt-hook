const CDP = require('chrome-remote-interface');
const fs = require('fs');
const DiscordSender = require('./discord.js');
const ChatLogger = require('./chat.js');
const TransactionsLogger = require('./transactions.js');
const { options, loggers, extensions } = require('./config.json');

CDP(options)
.then(client => {
    console.log(`CDP:  Connected to ${options.tab}`);
    const discord = new DiscordSender(loggers);

    const activeLoggers = {};
    for (let logger of loggers) {
        if (!logger.enabled) continue;
        let loggerInstance;
        switch (logger.name) {
            case 'chat':
                loggerInstance = new ChatLogger(client.Runtime, discord, null, logger.options);
                break;
            case 'transactions':
                loggerInstance = new TransactionsLogger(client.Runtime, discord, null, logger.options);
                break;
        }
        activeLoggers[logger.name] = loggerInstance;
    }

    for (let extension of extensions) {
        if (!extension.enabled) continue;
        let script = fs.readFileSync(`./extensions/${extension.name}.js`).toString();
        client.Runtime.evaluate({ expression: script })
        .then(() => console.log(`DOM:  Extension ${extension.name.replace('.js', '')} injected`));
    }

    client.Runtime.bindingCalled(async event => {
        switch (event.name) {
            case 'tthookChatMessage':
                await activeLoggers.chat.handleCall(event.payload);
                break;

            case 'tthookTransaction':
                await activeLoggers.transactions.handleCall(event.payload);
                break;

            default:
                console.log(`Binding ${event.name} called`);
                break;
        }
    });

    client.once('disconnect', () => {
        for (let key of Object.keys(activeLoggers)) activeLoggers[key].forceSend();
        console.log('CDP:  Disconnected');
    });

    for (let sig of ['SIGINT', 'SIGHUP']) {
        process.on(sig, async () => {
            for (let key of Object.keys(activeLoggers)) await activeLoggers[key].forceSend();
            process.exit();
        });
    }
})
.catch(err => console.error(`CDP:  ${err}`));
