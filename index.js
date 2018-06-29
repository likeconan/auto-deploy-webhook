var express = require('express')
var app = express()
var execSync = require('child_process').execSync;
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var log4js = require('log4js');
var path = require('path')

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

log4js.configure({
    appenders: {
        'auto-deploy': { type: 'file', filename: 'auto-deploy.log' },
    },
    categories: { default: { appenders: ['auto-deploy'], level: 'info' } }
});

const logger = log4js.getLogger('auto-deploy')

app.post('/', function (req, res) {
    try {
        const data = req.body;
        if (data.ref === 'refs/heads/test') {
            execSync(`cd /app/test/${data.repository.name} && git pull`);
            execSync(`cd /app/test/${data.repository.name} && yarn install && pm2 restart t-${data.repository.name}`);
            logger.info(`success build ${data.repository.name} on ${data.ref}`)

        }
        // else if (data.ref === 'refs/heads/master') {
        //     execSync(`cd /app/production/${data.repository.name} && git pull`);
        //     execSync(`cd /app/production/${data.repository.name} && yarn install && pm2 restart ${data.repository.name}`)
        //     logger.info(`success build ${data.repository.name} on ${data.ref}`)
        // }
        res.send('success')

    } catch (error) {
        logger.error(error.message)
    }
})

app.get('/deploy', function (req, res) {
    res.sendFile(path.join(__dirname, '/auto-deploy.log'))
})

app.listen(4040, function () {
    console.log('deploy success run on 4040')
})