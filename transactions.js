const Logger = require('./logger.js');

module.exports = class TransactionsLogger extends Logger {
    prefix = 'Transactions:';
    transactions = [];

    constructor(runtime, discord, server, options) {
        super(discord, server, options);
        runtime.addBinding({ name: 'tthookTransaction' })
        .then(() => this.log('Binding created'));
        runtime.evaluate({ expression: `
        document.querySelector('iframe[name=vrp]').contentWindow.addEventListener('message', event => {
            if (event.data.text != undefined) tthookTransaction(JSON.stringify(event.data));
        });
        ` })
        .then(() => this.log('Event listener created'));
    }

    handleCall(payload) {
        return new Promise(resolve => {
            let data = JSON.parse(payload);
            let type, name, item;
            if (data.text.startsWith('You were <span style=\'color:green\'>given</span>')) {
                type = 'in';
                name = this.removeHTML(data.text.match(/(?<=by ).*/)[0]);
                item = this.removeHTML(data.text.match(/\$+[A-Z0-9.]+|[0-9]+x .+(?= by)/)[0]);
                this.log(`Received ${item} from ${name}`);
            }
            else if (data.text.startsWith('You <span style=\'color:red\'>gave</span>')) {
                type = 'out';
                name = this.removeHTML(data.text.match(/(?<=to ).*/)[0]);
                item = this.removeHTML(data.text.match(/\$+[A-Z0-9.]+|[0-9]+x .+(?= to)/)[0]);
                this.log(`Gave ${item} to ${name}`);
            }
            else return;

            this.addTransactionItem(name, type, item);
            resolve();
        });
    }

    addTransactionItem(name, type, item) {
        for (let transaction of this.transactions) {
            if (transaction.name == name) {
                clearTimeout(transaction.timeout);
                type == 'in' ? transaction.in.push(item) : transaction.out.push(item);
                transaction.timestamp = new Date();
                transaction.timeout = setTimeout(this.sendTransaction.bind(this), 30000);
                return;
            }
        }
        this.transactions.push({
            name: name,
            in: type == 'in' ? [item] : [],
            out: type == 'out' ? [item] : [],
            timestamp: new Date(),
            timeout: setTimeout(this.sendTransaction.bind(this), 30000),
        });
    }

    sendTransaction() {
        let transaction = this.transactions.shift();
        let inEmbed, outEmbed;
        if (transaction.in.length > 0) {
            inEmbed = {
                title: `:inbox_tray: ${this.escapeEmojis(transaction.name)}`,
                description: transaction.in.join('\n'),
                timestamp: transaction.timestamp,
                color: 5025616,
            };
        }
        if (transaction.out.length > 0) {
            outEmbed = {
                title: `:outbox_tray: ${this.escapeEmojis(transaction.name)}`,
                description: transaction.out.join('\n'),
                timestamp: transaction.timestamp,
                color: 16007990,
            };
        }
        let embeds = [inEmbed, outEmbed].filter(embed => embed != null);
        this.discord.sendMessage('transactions', this.getDiscordMessagePrefix(transaction.timestamp), ...embeds);
    }

    forceSend() {
        return new Promise(resolve => {
            for (let i = 0; i < this.transactions.length; i++) this.sendTransaction();
            resolve();
        });
    }

    getDiscordMessagePrefix(timestamp) {
        let d = timestamp;
        let day = d.getDate();
        let month = d.getMonth() + 1;
        let year = d.getFullYear();
        let hours = (d.getHours() < 10 ? '0' : '') + d.getHours();
        let minutes = (d.getMinutes() < 10 ? '0' : '') + d.getMinutes();
        return `\`[${day}/${month}/${year} ${hours}:${minutes}]\``;
    }
}
