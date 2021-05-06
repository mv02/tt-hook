# Transport Tycoon Hook <img src="https://cdn.discordapp.com/icons/307266366174658560/a_d72caff0a3c1aa40b866de4b77c34991.gif" height="25">
System for logging data from [Transport Tycoon](http://tycoon.community) servers in real time using [Discord webhooks](https://support.discord.com/hc/en-us/articles/228383668-Intro-to-Webhooks) and [Chrome DevTools Protocol](https://chromedevtools.github.io/devtools-protocol).

Also works as an injector of various useful extensions for the game's UI.

![Features preview](https://i.imgur.com/EwAnC7H.png)

## Features
**Work in progress**, there's not much yet.
#### Loggers
* `chat` - Logging all chat messages from your server. Supports all message channels and most importantly, emojis. <img src="https://cdn.discordapp.com/emojis/677423508908670977.gif" height="20">
* `transactions` - Logs your item/money transactions, what you gave and what you received. <img src="https://cdn.discordapp.com/emojis/394652829387587585.png" height="20">
#### UI extensions
* `biztimer` - On-screen business collection timer. No more forgetting about the E times. <img src="https://cdn.discordapp.com/emojis/692733179022278766.png" height="20">
#### Possible future features
* Logger of experience gains, recreating the progress bars from your screen
* Cash balance history
* Business upgrades logger
* Custom M menu design and/or a generic CSS loader

## Prerequisites
You need to download and install [Node.js](https://nodejs.org/en/download) first.

## Installation
**TL;DR**: `git clone https://github.com/mv02/tt-hook.git`, `cd tt-hook`, `npm i`, `npm run config`, `.\config.json`, copy webhook URLs from Discord and debugger URL from http://localhost:13172/json, paste them in `config.json`, `node .`

---
1. [Download the source code](https://github.com/mv02/tt-hook/releases) and extract it to any location on your computer.

    **or**
    
    Clone this repository: `git clone https://github.com/mv02/tt-hook.git`

2. Open the command prompt (Win + R → cmd.exe) and navigate to your TT Hook location using the `cd` command.

    Example: `cd "C:/Users/Somebody/Desktop/tt-hook"`

3. Run `npm install` to install the dependencies.

    If this doesn't work, it means you haven't installed [Node.js](https://nodejs.org/en/download) properly.

4. Run `npm run config` to create the configuration file.

    This will create a `config.json` file in the root directory. Open it in any text editor, we'll need it later.
    
    If you ever need to reset your configuration to default, just use `npm run config` again.

5. If you want to use the available loggers, you must set up a Discord server.

    Create channels for the loggers you want to use and create a webhook in each of them (Server Settings → Integrations → Webhooks; you need the Manage webhooks permission for this).
    
    Example:
    
    ![Webhooks example](https://i.imgur.com/pLbYGMW.png)
    
    Copy the URL of each of your webhooks and paste them under the corresponding `webhook` option in `config.json`.

    For the loggers you do not wish to use, change `enabled` to `false`. Do the same with UI extensions.

6. While your FiveM is running, navigate to http://localhost:13172/json.

    Copy the `webSocketDebuggerUrl` and paste it into the `options.tab` property in `config.json`.
    
    ![Websocket Debugger URL](https://i.imgur.com/IlSMjqP.png)
    
    The beginning of your `config.json` should now look similar to this:
    ```json
    {
        "options": {
            "port": 13172,
            "tab": "ws://localhost:13172/devtools/page/A0AC7ACCB126D1875AEDC5CB17C469C1"
        },

        "loggers": [
            {
                "name": "chat",
                "enabled": true,
                "webhook": "https://discordapp.com/api/webhooks/some-webhook-url"
            },
            {
                "name": "transactions",
                "enabled": true,
                "webhook": "https://discordapp.com/api/webhooks/another-webhook-url"
            }
        ],

        "extensions": [
            {
                "name": "biztimer",
                "enabled": true
            }
        ],
    ```

7. Run `node .` to launch the application. You should always wait until all the UI elements have loaded (I'm looking into a way to make this easier). Extensions should now be injected and loggers start logging.

### Creating a shortcut
Use `npm run shortcut` to create a desktop shortcut.

### Loading custom DOM extensions
All JS files under `/extensions` directory that are registered in `config.json` will be evaluated in scope of the NUI root document. Ignore this if you don't know what it means.

## Advanced configuration
### Generic options
- `options` - The protocol connection options.
    - `port` - The port to use, shouldn't need to be changed. Default is `13172`.
    - `tab` - The debugger websocket URL, obtained from http://localhost:13172/json.
- `loggers` - List of loggers and their configuration.
    - `name` - Name of the logger, required to work properly.
    - `enabled` - Whether this logger will be used.
    - `webhook` - URL of the Discord webhook this logger should send messages to.
    - `options` - Logger specific configuration, described below. 
- `extensions` - List of UI extensions and their configuration.
    - `name` - Name of the extension, corresponds to filename under `extensions` directory.
    - `enabled` - Whether this extension will be used.
- `markdownCharacters` - List of characters that will be escaped before sending to prevent Discord from formatting the text. Shouldn't need to be changed. Default is ``[ "*", "_", "`", "~" ]``.
- `customEmojis` - Dictionary of custom emoji IDs and their Discord representations. Contains all current in-game emojis by default and shouldn't need to be changed.

### Logger options
- chat
    - `bufferSize` - How many messages are received before executing the webhook. Default is `5`. Lower numbers aren't recommended since it's easy to hit Discord rate limit.
    - `ignoredTypes` - List of message types that won't be logged. You can use the `/ignore` command, but this is useful for messages you want to have in-game and not in the log. Default is `[]`. Available message types are `chat`, `company`, `faction`, `dispatch`, `staff`, `leveling`, `radio`, `system`, `atc-landing` and `atc-takeoff`. 
- transactions
    - `timeout` - How long after the last item the transaction is logged, in seconds. Default is `30`.
