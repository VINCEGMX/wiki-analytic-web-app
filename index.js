var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var session = require('express-session');

var surveyRouter = require('./app/routes/server.route');

var app = express();
app.set('views', path.join(__dirname, 'app/views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// the session will expire in 60 seconds (60,000 milliseconds)
// change this into 30 minutes after testing
// ref: https://github.com/expressjs/session
app.use(session({
    secret: 'ssshhhhh',
    cookie: {maxAge: 1800000},
    resave: true,
    saveUninitialized: true
}));

app.use('/', surveyRouter);

app.listen(3000, function() {
    console.log('survey app is listening on port 3000!');
});