const BaseCommand = require('../Classes/BaseCommand.js')
const Logger = require('../util/Logger.js')
const {defaultServer} = require('../config.json')

class Sub extends BaseCommand {
  constructor (bot) {
    const permissions = {
      'Test-Server': {
        channels: [],
        roles: [],
        users: []
      },
      'Heroes Lounge': {
        channels: ['role_requests'],
        roles: [],
        users: []
      }
    }

    const options = {
      prefix: '!',
      command: 'sub',
      aliases: ['substitute', 'subplayer'],
      description: 'Add or remove yourself from the sub player role group'
    }

    super(permissions, options)
    this.bot = bot
  }

  exec (msg) {
    const guild = msg.channel.guild || this.bot.guilds.get(defaultServer)
    const member = guild.members.get(msg.author.id)
    const role = guild.roles.find((role) => {
      return role.name === 'Sub'
    })

    if (member) {
      updateMember(member, role).then((notificationMessage) => {
        this.bot.getDMChannel(msg.author.id)
          .then(channel => channel.createMessage(notificationMessage))
          .catch(error => Logger.warn(`Could not notify ${member.username} about ${role.name} role status`, error))
      }).catch((error) => {
        Logger.error(`Could not update ${role.name} status of ${member.username}`, error)
      })
    } else {
      this.bot.getDMChannel(msg.author.id)
        .then(channel => channel.createMessage(`You are not part of ${guild.name} so can not assign ${role.name}`))
        .catch(error => Logger.warn(`Could not notify ${msg.author.username} about not belonging to ${guild.name}`, error))
    }
  }
}

let updateMember = async (member, role) => {
  if (!member.roles.includes(role.id)) {
    return member.addRole(role.id)
      .then(() => {
        return `Welcome to the ${member.guild.name} substitute player group.`
      }).catch((error) => {
        throw error
      })
  } else {
    return member.removeRole(role.id)
      .then(() => {
        return `You have left the ${member.guild.name} substitute player group.`
      }).catch((error) => {
        throw error
      })
  }
}

module.exports = Sub
