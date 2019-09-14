const BaseCommand = require('../Classes/BaseCommand.js');
const { Logger } = require('../util.js');

const fs = require('fs').promises;
const path = require('path');

class Reload extends BaseCommand {
  constructor (bot) {
    const commandFolder = __filename.substring(__dirname.length + 1, __filename.length - 3).toLowerCase();
    const {permissions, options} = require(`./${commandFolder}/`);

    super(permissions, options);
    this.bot = bot;
  }

  exec (msg) {
    let warnings = '';

    Promise.all(
      [
        reloadCommands(this.bot, path.join(__dirname, '../Commands')).catch((error) => {
          const warningMessage = 'Unable to reload commands';
          warnings += warningMessage + '\n';
          Logger.warn(warningMessage, error);
        }),
        reloadEvents(this.bot, path.join(__dirname, '../Events')).catch((error) => {
          const warningMessage = 'Unable to reload events';
          warnings += warningMessage + '\n';
          Logger.warn(warningMessage, error);
        })
      ]
    ).then(() => {
      msg.author.getDMChannel().then((channel) => {
        if (warnings.length > 0) {
          return channel.createMessage(warnings);
        }

        return msg.addReaction('✅');
      }).catch((error) => {
        Logger.warn('Unable to inform about command reload', error);
      });
    });
  }
}

module.exports = Reload;

const reloadCommands = (bot, dir) => {
  bot.commands.clear();
  return fs.readdir(dir).then((commands) => {
    for (let i = 0; i < commands.length; i++) {
      delete require.cache[require.resolve(path.join(dir, commands[i]))];

      const Command = require(path.join(dir, commands[i]));
      const command = new Command(bot);
      bot.commands.set(command.command, command);
    }
  }).catch((error) => {
    throw error;
  });
};

const reloadEvents = (bot, dir) => {
  bot.removeAllListeners();
  return fs.readdir(dir).then((events) => {
    for (let i = 0; i < events.length; i++) {
      delete require.cache[require.resolve(path.join(dir, events[i]))];

      const event = require(path.join(dir, events[i]));
      event(bot);
    }
  }).catch((error) => {
    throw error;
  });
};
