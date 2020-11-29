sendServerAddress(serverAddress);

document.querySelector('body iframe[name=chat]').contentWindow.addEventListener('message', event => {
    if (event.data.type == 'ON_MESSAGE') {
        let msgObject = event.data.message;
        console.log('Message received:', msgObject.channel, msgObject.args);
        let msg;

        if (msgObject.channel != undefined) {
            if (msgObject.channel.includes('chat')) msg = '**' + msgObject.args[0] + msgObject.args[2] + msgObject.args[3] + '**: ' + msgObject.args[1];
            else if (msgObject.channel.includes('radio')) msg = msgObject.args[0] + ': ' + msgObject.args[1];
            else if (msgObject.channel.includes('system')) msg = msgObject.args[0];
            else if (/company|faction|dispatch/g.test(msgObject.channel)) msg = '**' + msgObject.args[0] + '**: ' + msgObject.args[1];
            else msg = msgObject.args.join(' ');
        }
        else if (msgObject.templateId != undefined) {
            if (msgObject.templateId == 'atc-takeoff') msg = msgObject.args[0] + ' ATC: ' + msgObject.args[1] + ' is preparing takeoff from runway ' + msgObject.args[2];
            else if (msgObject.templateId == 'atc-landing') msg = msgObject.args[0] + ' ATC: ' + msgObject.args[1] + ' is preparing to land on runway ' + msgObject.args[2];
            else msg = msgObject.args.join(' ');
        }
        else msg = msgObject.args.join(' ');

        sendMessage(msg);
    }
    else console.log(event.data.type, 'event');
});