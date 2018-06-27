var express = require('express')
var app = express()
var exec = require('child_process').exec;


app.post('/', function (req, res) {
    debugger
    res.send('Hello World')
})

app.listen(4050)