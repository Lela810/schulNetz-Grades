const mongoose = require('mongoose');
const discord = require('./js/discord.js');
const { scrape } = require('./js/schulNetzScrape.js');

require('dotenv').config()


mongoose.connect(`mongodb://${process.env.MONGODB}/Grades`, { useNewUrlParser: true })
const db = mongoose.connection
db.on('error', (error) => console.error(error))
db.once('open', () => console.log('Connected to Database'))


console.log(scrape("https://gibz.zg.ch/public/mindex.php?longurl=ieFZLG8e6hntKjJSpKv4E0wnhUan7PRtWxaQKCYNTD66Ac5c5CTW2KbwXkMA7qQ7", "3107"))