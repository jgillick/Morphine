var express = require('express'),
    hbs = require('hbs'),
    compass = require('node-compass'),
    assets = require('connect-assets'),
    cons = require('consolidate');

// Setup express
var app = express();
app.configure(function() {
    app.use(express.logger('dev'));
    app.use(compass());
    app.use(assets({}));
    app.use('/', express.static(__dirname + '/assets'));
});

app.engine('html', cons.underscore);
app.set('view engine', 'html');
app.set('views', __dirname + '/views');


// Handlebars
//app.set('view engine', 'hbs');
//require('handlebars-form-helpers').register(hbs.handlebars);

// Index
app.get('/', function(req, res){
  res.render('index', {});
});

// New
app.get('/new', function(req, res) {
  res.render('create', {endpoint: {
    url: '/api',
    fields: {
      methodList: [
        {text: 'GET', value: 'GET'},
        {text: 'POST', value: 'POST'},
        {text: 'PUT', value: 'PUT'},
        {text: 'DELETE', value: 'DELETE'}
      ]
    }
  }});
});

app.listen(3000);
console.log('Started on port 3000');