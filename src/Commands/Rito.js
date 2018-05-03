const BaseCommand = require('../Classes/BaseCommand.js')
const config = require('../config.json')

class Rito extends BaseCommand {
  constructor (bot) {
    const permissions = {
      'Test-Server': {
        channels: ['robotchannel'],
        roles: ['Admin'],
        users: []
      },
      'Heroes Lounge': {
        channels: [],
        roles: ['Lounge Master', 'Manager', 'Moderators', 'Staff', 'VIP'],
        users: ['108153813143126016']
      }
    }

    const options = {
      prefix: '#',
      command: 'rito',
      description: 'Have Heroesbot join in on the rito',
      cooldown: config.memeCooldown,
      invokeDM: false,
      ignoreInHelp: true
    }

    super(permissions, options)
  }

  exec (msg) {
    const emojisArray = [
      ':fire_:369251928250515486',
      '🔫',
      ':RageSloth:438468862967545869',
      '🗡',
      '🔥'
    ]

    for (let emoji of emojisArray) {
      msg.addReaction(emoji)
    }
  }
}

module.exports = Rito