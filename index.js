(async() => {

    await require('dotenv').config()
    const { client } = require('./js/discord.js');
    const { notify } = require('./js/notification.js');
    const { connect, connection } = require('mongoose');
    const { Gauge } = require('clui');
    const { LiveContainer } = require('clui-live');
    const { plot } = require('asciichart');


    const container = new LiveContainer().hook();


    connect(`mongodb://${process.env.MONGODB}/schulNetz-grades`, { useNewUrlParser: true })
    const db = connection
    db.on('error', (error) => console.error(error))
    db.once('open', () => console.log('Connected to Database'))


    if (process.env.PROD == 'true') { client.login(process.env.BOT_TOKEN); } else { client.login(process.env.DEV_TOKEN); }


    console.clear()


    const area1 = container.createLiveArea();
    const area2 = container.createLiveArea();


    let runtimeHistory = [0]

    async function runNotification() {

        const startTime = performance.now();
        try { await notify() } catch (error) { console.error(error) }
        const endTime = performance.now();

        const runtime = ((endTime - startTime) / 1000).toFixed(2);
        let total = Math.ceil(runtime / 10)
        if (total <= 1) { total = 10 }


        area1.write(plot(runtimeHistory, { padding: '      s', height: '10' }))
        area2.write('\n  ' + Gauge(runtime, total, 20, total * 0.8, runtime + `s / ${total}s Total`) + '\n');

        if (runtimeHistory.length >= 60) {
            runtimeHistory.shift();
            runtimeHistory[0] = 0
        }
        runtimeHistory.push(runtime)

        setTimeout(runNotification, 10000)
        return
    }

    setTimeout(async() => { await runNotification() }, 1000)




})()