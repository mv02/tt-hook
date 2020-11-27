document.querySelector('body iframe[name=chat]').contentWindow.addEventListener('message', event => {
    if (event.data.type == 'ON_MESSAGE') {
        let msgObject = event.data.message;
        console.log('Message received:', msgObject.channel, msgObject.args);
        let msg;

        if (msgObject.channel.includes('chat')) msg = '**' + msgObject.args[0] + msgObject.args[2] + msgObject.args[3] + '**: ' + msgObject.args[1];
        else if (msgObject.channel.includes('system')) msg = msgObject.args[0];
        else msg = msgObject.args.join(' ');

        // odstran color kody ^1 ^2...
        msg = msg.replace(/\^[0-9a-z*]/g, '');
        // odstran \s s\, \a a\, \r r\ u emojis ID
        msg = msg.replace(/\\[a-z!]/g, '').replace(/[a-z!]\\/g, '');
        
        sendMessage(msg);
    }
    else console.log(event.data.type, 'event');
});