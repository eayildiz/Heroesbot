const Client = require('./Client.js')
const { token, environment } = require('./config.js')
const cron = require('node-cron')

const client = new Client(token, {
  getAllUsers: true,
  disableEveryone: false
})

const regionTask = cron.schedule('0 0 * * *', () => {
  client.bot.commands.get('assignregion').exec()
}, {
  scheduled: false
})

const remindTask = cron.schedule('* * * * *', () => {
  client.bot.commands.get('remind').remind()
}, {
  scheduled: false
})

client.launch().then(() => {
  if (environment === 'production') {
    regionTask.start()
    remindTask.start()
  }
})
