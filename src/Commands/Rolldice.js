const BaseCommand = require('../Classes/BaseCommand.js');
const { Logger } = require('../util.js');

class Rolldice extends BaseCommand {
  constructor (bot) {
    const permissions = {
      'Test-Server': {
        channels: ['robotchannel'],
        roles: [],
        users: []
      },
      'Heroes Lounge': {
        channels: ['devops'],
        roles: [],
        users: []
      }
    };

    const options = {
      prefix: '!',
      command: 'roll',
      aliases: ['rolldice', 'dice'],
      description: 'Rolls dice',
      syntax: 'roll [number of dice] d[number of faces] \nDefaults to 1 die, with 6 faces.'
    };

    super(permissions, options);
  }

  exec (msg) {
    const nDice = (msg.content.match(/\s\d+/i) ? parseInt(msg.content.match(/\d+/i)) : 1);
    const nFaces = (msg.content.match(/[d]\d+/i) ? parseInt(msg.content.match(/[d]\d+/i)[0].substr(1)) : 6);

    const roll = rollDice(nDice, nFaces);
    const total = roll.reduce((total, num) => {
      return total + num;
    });

    let output = '```' + 'Dice results: ' + roll + '.\n\n' + 'Total: ' + total + '```';
    if (output.length > 1000) {
      output = '```Total: ' + total + '```';
    }

    msg.channel.createMessage(output).catch((error) => {
      Logger.error('Unable to respond with dice roll result', error);
    });
  }
}

const rollDice = (nDice, nFaces) => {
  const outcomes = [];

  for (let i = 0; i < nDice; i++) {
    const roll = Math.floor((Math.random() * nFaces) + 1);
    outcomes.push(roll);
  }
  return outcomes;
};

module.exports = Rolldice;
