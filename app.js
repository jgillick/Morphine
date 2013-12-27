var express = require('express'),
    hbs = require('hbs'),
    compass = require('node-compass'),
    assets = require('connect-assets'),
    cons = require('consolidate'),
    fs = require('fs'),
    fpath = require('path'),
    mkdirp = require('mkdirp');

// Setup express
var app = express();
app.configure(function() {
    app.use(express.logger('dev'));
    app.use(compass());
    app.use(assets({}));
    app.use(express.bodyParser());
    app.use('/', express.static(__dirname + '/assets'));
});

app.engine('html', cons.underscore);
app.set('view engine', 'html');
app.set('views', __dirname + '/views');

// Morphine options
var endpointDir = './endpoints/',
    endpointRootURLPath = '/api/';


// Handlebars
//app.set('view engine', 'hbs');
//require('handlebars-form-helpers').register(hbs.handlebars);

// Index
app.get('/', function(req, res){
  res.render('index', {});
});

// Save
app.post('/endpoints', function(req, res) {
  var data = req.body,
      path = data.endpoint.path || '',
      filepath = fpath.join(endpointDir +'/'+ fpath.dirname(path));
      filename = fpath.basename(path) +'.json';

  // Remove trailing slash
  if (path && path.match(/\/$/) != null) {
    path = path.replace(/\/+$/, '');
  }
  path = path.trim();

  // Root URLs not allowed
  if (path == '') {
    res.send('500', 'Cannot create an endpoint at /')
  }

  // Create file path
  if (!fs.existsSync(filepath)){
    try {
      mkdirp.sync(filepath);
    } catch (err){
      res.send(500, err.toString());
    }
  }

  // Write file
  fs.writeFile(fpath.join(filepath, filename), JSON.stringify(data), function(err){
    if (err) {
      res.send(500, err);
    }
    res.send(200);
  });
});

app.listen(3000);
console.log('Started on port 3000');