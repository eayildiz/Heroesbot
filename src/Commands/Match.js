const BaseCommand = require('../Classes/BaseCommand.js')
const Logger = require('../util/Logger.js')

class Match extends BaseCommand {
  constructor (bot) {
    const permissions = {
      'Test-Server': {
        channels: ['robotchannel'],
        roles: [],
        users: []
      },
      'Heroes Lounge': {
        channels: ['match_lounge_1', 'match_lounge_2', 'match_lounge_3', 'match_lounge_4', 'match_lounge_5', 'match_lounge_6', 'match_lounge_7', 'match_lounge_8', 'match_lounge_9', 'match_lounge_10', 'match_lounge_11', 'match_lounge_12', 'match_lounge_13', 'match_lounge_14', 'match_lounge_15', 'match_lounge_16', 'match_lounge_17', 'match_lounge_18', 'match_lounge_19', 'match_lounge_20', 'devops', 'mockdrafts'],
        roles: [],
        users: []
      },
      'HotS - Nexus Brawls': {
        channels: ['match_lounge_1', 'match_lounge_2'],
        roles: [],
        users: []
      },
      'Nexus Schoolhouse': {
        channels: ['mockdrafts'],
        roles: [],
        users: []
      }
    }

    const options = {
      prefix: '!',
      command: 'match',
      aliases: [],
      description: 'Determines whether you have map pick or first pick.',
      syntax: 'match'
    }

    super(permissions, options)
    this.bot = bot
  }

  exec (msg) {
    const embed = {
      color: this.bot.embed.color,
      footer: this.bot.embed.footer,
      description: ''
    }

    const base = 'The draft order has been randomly determined:\n'
    const map = '```\n' + msg.author.username + ': Map pick \nOpponent: First pick \n```\n' + msg.author.username + ', please ban a map first.'
    const pick = '```\n' + msg.author.username + ': First pick \nOpponent: Map pick \n```\nOpponent, please ban a map first.'

    const output = Math.random() >= 0.5 ? map : pick

    embed.description += '[Amateur series rules](https://heroeslounge.gg/general/ruleset)\n[Division S rules](https://heroeslounge.gg/divisionS/ruleset)\n'
    embed.description += base + output

    return msg.channel.createMessage({ 'embed': embed }).catch((error) => {
      Logger.error('Unable to respond with coinflip result', error)
    })
  }
}

module.exports = Match