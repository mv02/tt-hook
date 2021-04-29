const emojiRegex = require('emoji-regex/RGI_Emoji.js');
const { customEmojis, markdownCharacters } = require('./config.json');

module.exports = class Logger {
    constructor(discord, server) {
        this.discord = discord;
        this.server = server;
    }
    
    removeColorCodes(string) {
        return string.replace(/\^[0-9a-z*]/g, '');
    }

    removeHTML(string) {
        return string.replace(/<[^<>]*>/g, '');
    }

    insertEmojis(string) {
        // unicode
        let urls = string.match(/\\!.*!\\/g) || [];
        for (let url of urls) {
          if (url.includes('https://github.githubassets.com/images/icons/emoji/unicode')) {
            let code = url.match(/\w*\.png/g)[0].replace('.png', '');
            string = string.replace(url, String.fromCodePoint('0x' + code));
          }
          else string = string.replace(url, `<${url}>`);
        }

        // custom
        for (let [key, value] of Object.entries(customEmojis)) {
            let regex = new RegExp(`\\\\[as]${key}[as]\\\\`, 'g');
            string = string.replace(regex, value);
        }
        return string;
    }

    escapeEmojis(string) {
        let emojis = [...new Set(string.match(emojiRegex()) || [])];
        for (let emoji of emojis) {
            let regex = new RegExp(emoji, 'g');
            string = string.replace(regex, '\\' + emoji);
        }
        return string;
    }
    
    escapeMarkdown(string) {
        for (let char of markdownCharacters) {
            let regex = new RegExp(`[${char}]`, 'g');
            string = string.replace(regex, '\\' + char);
        }
        return string;
    }

    log(...messages) {
        console.log(`${this.prefix} ${messages.join(' ')}`);
    }
}
