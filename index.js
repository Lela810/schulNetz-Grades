(async() => {

    await require('dotenv').config()
    const { client } = require('./js/discord.js');
    const { notify } = require('./js/notification.js');

    const mongoose = require('mongoose');


    mongoose.connect(`mongodb://${process.env.MONGODB}/schulNetz-grades`, { useNewUrlParser: true })
    const db = mongoose.connection
    db.on('error', (error) => console.error(error))
    db.once('open', () => console.log('Connected to Database'))



    client.login(process.env.BOT_TOKEN);


    async function runNotification() {
        const startTime = performance.now();
        try { await notify() } catch (error) { console.error(error) }
        const endTime = performance.now();
        const runtime = endTime - startTime
        const nextRun = runtime + 1000 * 10;
        setTimeout(runNotification, nextRun)
        return
    }

    setTimeout(async() => { await runNotification() }, 1000)






})()