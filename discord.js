const axios = require('axios');

module.exports = class DiscordSender {
    webhooks = {};

    constructor(loggers) {
        for (let logger of loggers) {
            if (!logger.enabled) continue;
            this.webhooks[logger.name] = {
                webhook: logger.webhook,
                ratelimitRemaining: 5,
                resetAfter: 0,
            };
        }
    }

    sendMessage(logger, message, ...embeds) {
        return new Promise(resolve => {
            this.timeout(this.webhooks[logger].ratelimitRemaining == 0 ? this.webhooks[logger].ratelimitResetAfter + 1000 : 0)
            .then(() => {
                axios.post(this.webhooks[logger].webhook, { content: message, embeds: embeds })
                .then(res => {
                    this.webhooks[logger].ratelimitRemaining = res.headers['x-ratelimit-remaining'];
                    this.webhooks[logger].ratelimitResetAfter = res.headers['x-ratelimit-reset-after'] * 1000;
                    console.log(`Disc: Executed ${logger} webhook`);
                    resolve();
                })
                .catch(err => {
                    this.webhooks[logger].ratelimitResetAfter = err.response.data.retry_after;
                    console.error(`Disc: Error while executing ${logger} webhook: ${err.message}`);
                    resolve();
                });
            });
        });
    }

    timeout(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
