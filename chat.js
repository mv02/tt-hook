const Logger = require('./logger.js');

module.exports = class ChatLogger extends Logger {
    prefix = 'Chat:';
    chatMessages = [];

    constructor(runtime, discord, server) {
        super(discord, server);
        runtime.addBinding({ name: 'tthookChatMessage' })
        .then(() => this.log('Binding created'));
        runtime.evaluate({ expression: `
        document.querySelector('iframe[name=chat]').contentWindow.addEventListener('message', event => {
            if (event.data.type == 'ON_MESSAGE') tthookChatMessage(JSON.stringify(event.data.message));
        });
        ` })
        .then(() => this.log('Event listener created'));
    }

    handleCall(payload) {
        return new Promise(resolve => {
            let messageObject = JSON.parse(payload);
            let type = this.getMessageType(messageObject);
            let message = this.assembleDiscordMessage(messageObject, type);
            this.log(`Received a ${type} message: ${message.substr(0, 150)}${message.length > 150 ? ' ...' : ''}`);
            this.chatMessages.push(this.getDiscordMessagePrefix() + message);
            if (this.chatMessages.length >= 5) {
                let toSend = [];
                for (let i = 0; i < 5; i++) toSend.push(this.chatMessages.shift());
                this.discord.sendMessage('chat', toSend.join('\n'))
                .then(() => resolve());
            }
        });
    }

    forceSend() {
        return new Promise(resolve => {
            this.discord.sendMessage('chat', this.chatMessages.join('\n') + '\nDisconnected.').then(() => {
                this.chatMessages = [];
                resolve();
            });
        });
    }

    assembleDiscordMessage({ args }, type) {
        args = args.map(item => this.escapeMarkdown(this.removeColorCodes(item)));
        switch (type) {
            case 'atc-landing':
                return `${args[0]} ATC: ${this.escapeEmojis(args[1])} is preparing to land on runway ${args[2]}`;
            case 'atc-takeoff':
                return `${args[0]} ATC: ${this.escapeEmojis(args[1])} is preparing takeoff from runway ${args[2]}`;
            case 'radio':
                return `${args[0]}: ${args[1]}`;
            case 'leveling':
                return this.escapeEmojis(args[0]);
            case 'company':
            case 'faction':
            case 'dispatch':
                return `**${this.escapeEmojis(args[0])}**: ${this.insertEmojis(args[1])}`;
            case 'chat':
            case 'staff':
                return `**${args[0]}${this.escapeEmojis(args[2] + args[3])}**: ${this.insertEmojis(args[1])}`;
            default:
                return args.join(' ');
        }
    }

    getMessageType({ channel, templateId }) {
        if (templateId == 'atc-landing') return 'atc-landing';
        if (templateId == 'atc-takeoff') return 'atc-takeoff';
        if (channel.includes('radio')) return 'radio';
        if (channel.includes('leveling')) return 'leveling';
        if (channel.includes('company')) return 'company';
        if (channel.includes('faction')) return 'faction';
        if (channel.includes('dispatch')) return 'dispatch';
        if (channel.includes('chat')) return 'chat';
        if (channel.includes('all')) return 'staff';
        if (channel.includes('system')) return 'system';
        return 'unknown';
    }

    getDiscordMessagePrefix() {
        let d = new Date();
        let day = d.getDate();
        let month = d.getMonth() + 1;
        let year = d.getFullYear();
        let hours = (d.getHours() < 10 ? '0' : '') + d.getHours();
        let minutes = (d.getMinutes() < 10 ? '0' : '') + d.getMinutes();
        let seconds = (d.getSeconds() < 10 ? '0' : '') + d.getSeconds();
        return `\`[${day}/${month}/${year} ${hours}:${minutes}:${seconds}]\` `;
    }
}
