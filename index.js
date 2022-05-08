(async() => {

    require('dotenv').config()
    const { client } = require('./js/discord.js');
    const { notify } = require('./js/notification.js');

    const mongoose = require('mongoose');


    mongoose.connect(`mongodb://${process.env.MONGODB}/schulNetz-grades`, { useNewUrlParser: true })
    const db = mongoose.connection
    db.on('error', (error) => console.error(error))
    db.once('open', () => console.log('Connected to Database'))



    client.login(process.env.BOT_TOKEN);

    setInterval(async() => { await notify() }, 1000 * 10);



    //client.destroy()
    //console.log(await scrape("https://gibz.zg.ch/public/mindex.php?longurl=ieFZLG8e6hntKjJSpKv4E0wnhUan7PRtWxaQKCYNTD66Ac5c5CTW2KbwXkMA7qQ7", "3107"))

})()