var express = require('express')
var app = express()
var execSync = require('child_process').execSync;
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var log4js = require('log4js');
var path = require('path')
var fs = require('fs');
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
        console.log(data);
        if (data.ref === 'refs/heads/test') {
            console.log('try to deploy with test')
            execSync(`cd /app/test/${data.repository.name} && git pull`);
            if (data.repository.name === 'tcweibo-api') {
                execSync(`cd /app/test/${data.repository.name} && yarn install && pm2 restart ecosystem.config.js --only t-${data.repository.name}`);
            } else {
                execSync(`cd /app/test/${data.repository.name} && yarn install && pm2 restart t-${data.repository.name}`);
            }

            logger.info(`success build ${data.repository.name} on ${data.ref}`)

        }
        else if (data.ref === 'refs/heads/master') {
            execSync(`cd /app/production/${data.repository.name} && git pull`);
            if (data.repository.name === 'tcweibo-api') {
                execSync(`cd /app/production/${data.repository.name} && yarn install && pm2 restart ecosystem.config.js --only ${data.repository.name}`)
            } else {
                execSync(`cd /app/production/${data.repository.name} && yarn install && pm2 restart ${data.repository.name}`)
            }
            logger.info(`success build ${data.repository.name} on ${data.ref}`)
        }
        console.log('success deploy')
        res.send('success')
    } catch (error) {
        logger.error(error.message)
    }
})

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, '/auto-deploy.log'))
})

app.get('/test/api', function (req, res) {
    res.sendFile(path.join(__dirname, '../../test/tcweibo-api/weibo-api-admin.log'))
})

app.get('/production/api', function (req, res) {
    res.sendFile(path.join(__dirname, '../../test/tcweibo-api/weibo-api-admin.log'))
})

app.get('/logs', function (req, res) {
    const files = fs.readdirSync('/root/.pm2/logs')
    let a = ''
    files.forEach((val) => a = a + `<p><a href='/logs/${val}' target='_blank'>${val}</a></p>`)
    const html = `<div><h1>Logs to View</h1>${a}</div>`
    res.send(html)
})

app.get('/logs/:path', function (req, res) {
    res.sendFile(`/root/.pm2/logs/${req.params.path}`)
})

const port = 7033;

app.listen(port, function () {
    console.log('deploy success run on ' + port)
})