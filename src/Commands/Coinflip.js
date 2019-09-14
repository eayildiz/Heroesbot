const BaseCommand = require('../Classes/BaseCommand.js');
const fs = require('fs').promises;
const path = require('path');

class Coinflip extends BaseCommand {
  constructor (bot) {
    const commandFolder = __filename.substring(__dirname.length + 1, __filename.length - 3).toLowerCase();
    const {permissions, options} = require(`./${commandFolder}/`);

    super(permissions, options);
  }

  exec (msg) {
    const output = Math.random() >= 0.5 ? 'heads' : 'tails';
    return fs.readFile(path.join(__dirname, `../Data/Images/${output}.png`)).then((file) => {
      return msg.channel.createMessage({
        content: 'Please use the `!match` command to determine the draft order.',
        image: {
          url: `attachment://${output}.png`
        }
      },
      {
        file: file,
        name: `${output}.png`
      });
    });
  }
}

module.exports = Coinflip;
