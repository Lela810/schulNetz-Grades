(async() => {



    const { client } = require('./js/discord.js');
    const { notify } = require('./js/notification.js');
    const { connect, connection } = require('mongoose');
    const { Gauge } = require('clui');


    connect(`mongodb://${process.env.MONGODB}/schulNetz-grades`, { useNewUrlParser: true })
    const db = connection
    db.on('error', (error) => console.error(error))
    db.once('open', () => console.log('Connected to Database'))


    if (process.env.PROD == 'true') {
        client.login(process.env.BOT_TOKEN);
    } else {
        client.login(process.env.DEV_TOKEN);
        await require('dotenv').config()
    }


    async function runNotification() {

        const startTime = performance.now();
        try { await notify() } catch (error) { console.error(error) }
        const endTime = performance.now();

        const runtime = endTime - startTime
        const nextRun = runtime + 1000 * 10;
        let total = Math.ceil(runtime / 1000 / 10)
        if (total <= 1) { total = 10 }

        console.log(Gauge((runtime / 1000).toFixed(2), total, 20, total * 0.8, (runtime / 1000).toFixed(2) + `s / ${total}s Total`));

        setTimeout(runNotification, 10000)
        return
    }

    setTimeout(async() => { await runNotification() }, 1000)




})()