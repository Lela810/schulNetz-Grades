(async() => {

    await require('dotenv').config()
    const { client } = require('./js/discord.js');
    const { notify } = require('./js/notification.js');
    const { connect, connection } = require('mongoose');
    const { LineBuffer, Line } = require('clui');
    const { LiveContainer } = require('clui-live');
    const { plot } = require('asciichart');
    const { green } = require('cli-color');


    const container = new LiveContainer().hook();


    connect(`mongodb://${process.env.MONGODB}/schulNetz-grades`, { useNewUrlParser: true })
    const db = connection
    db.on('error', (error) => console.error(error))
    db.once('open', () => console.log('Connected to Database'))


    if (process.env.PROD == 'true') { client.login(process.env.BOT_TOKEN); } else { client.login(process.env.DEV_TOKEN); }



    let outputBuffer = new LineBuffer({
        x: 2,
        y: 0,
        width: 'console',
        height: '2'
    });

    new Line(outputBuffer)
        .column('Live Runtime', 20, [green])
        .fill()
        .store();
    new Line(outputBuffer)
        .column('------------', 20, [green])
        .fill()
        .store();



    console.clear()

    container.createLiveArea().write(outputBuffer.output());
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


        area1.write(plot(runtimeHistory, { padding: '      s' }))
        area2.write('\n  ' + green('Console Output') + '\n  ' + green('--------------') + '\n');

        if (runtimeHistory.length >= 30) {
            runtimeHistory.shift();
            runtimeHistory[0] = 0
        }
        runtimeHistory.push(runtime)

        setTimeout(runNotification, 100)
        return
    }

    setTimeout(async() => { await runNotification() }, 1000)




})()