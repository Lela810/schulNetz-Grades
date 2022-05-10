(async() => {

    await require('dotenv').config()
    const { client } = require('./js/discord.js');
    const { notify } = require('./js/notification.js');
    const { connect, connection } = require('mongoose');


    connect(`mongodb://${process.env.MONGODB}/schulNetz-grades`, { useNewUrlParser: true })
    const db = connection
    db.on('error', (error) => console.error(error))
    db.once('open', () => console.log('Connected to Database'))


    if (process.env.PROD == 'true') { client.login(process.env.BOT_TOKEN); } else { client.login(process.env.DEV_TOKEN); }


    async function runNotification() {
        const startTime = performance.now();
        try { await notify() } catch (error) { console.error(error) }
        const endTime = performance.now();
        const runtime = endTime - startTime
        console.log(`Notification finished in ${(runtime / 1000).toFixed(2)}s`)
        const nextRun = runtime + 1000 * 10;
        setTimeout(runNotification, nextRun)
        return
    }

    setTimeout(async() => { await runNotification() }, 1000)




})()