var express = require('express'),
    routes = require('./routes'),
    fpath = require('path'),
    compass = require('node-compass'),
    assets = require('connect-assets'),
    cons = require('consolidate');


// Morphine options
GLOBAL.endpoint = {
  dir: './endpoints/',
  rootURI: '/api/'
}

// Setup express
var server = express();
server.configure(function() {
    server.use(express.logger('dev'));
    server.use(compass());
    server.use(assets({}));
    server.use(express.bodyParser());

    server.use(compass({
        project: fpath.join(__dirname, 'assets'),
        logging: true
    }));
    server.use('/', express.static(__dirname + '/assets'));
});

server.engine('html', cons.underscore);
server.set('view engine', 'html');
server.set('views', __dirname + '/views');

// Load all endpoints

// Router handlers
routes.attachHandlers(server);

// Handlebars
//server.set('view engine', 'hbs');
//require('handlebars-form-helpers').register(hbs.handlebars);

server.listen(3000);
console.log('Started on port 3000');