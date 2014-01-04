
/**
  API endpoint processor
*/
var http = require('http'),
    https = require('https'),
    util = require('util'),
    url = require('url'),
    fs = require('fs'),
    fpath = require('path'),
    mkdirp = require('mkdirp'),
    vm = require('vm'),
    Handlebars = require('handlebars'),
    querystring = require('querystring');

// Endpoint lookup arrays
var allEndpoints = {}, // ID => filePath
    endpointPaths = {}, // ID => path
    endpointIds = {};   // path => ID

/**
  Recursively read directory tree and return basic endpoint objects for each endpoint file.

  @param {String} path   The path to read from
  @param {Function} callback  A callback function that gets two arguments: err and endpoints
*/
function readEndpointTree(path, callback) {
  var endpoints = {};

  // File file list in path
  fs.readdir(path, function(err, files){
    if (err) return callback(err);
    var pending = files.length;

    // Loop through all files
    files.forEach(function(file, index){
      var filepath = fpath.join(path, file);

      // Get file stats
      fs.lstat(filepath, function(err, stat){

        // Dive into the directory
        if (stat && stat.isDirectory()) {
          readEndpointTree(filepath, function(err, children){
            if (err) return callback(err);
            pending--;
            if (!pending) return callback();
          });
        }

        // Add file name to list
        else {

          // Endpoint JSON
          if (fpath.extname(file).toLowerCase() == '.json') {
            Endpoint.loadFromFile(filepath, function(err, json) {
              var id = json.id;

              if (err) {
                console.log(util.format('Could not load %s, might not be a valid endpoints file: %s', filepath. err.toString()));
              }
              else {
                allEndpoints[id] = {
                  'path': json.path,
                  'file': filepath,
                  'id': id
                }
                endpointIds[json.path] = json.id;
              }

              pending--;
              if (!pending) return callback();
            });
          }
          else {
            pending--;
            if (!pending) return callback();
          }
        }
      });
    });

    // Return if everything has been read
    if (!pending) {
      callback();
    }
  });
}

/**
  Make a request to a remote and return the response

  @param {Object} remote The JSON definition for the remote
  @param {Object} req The HTTP request object
  @param {Function} callback A callback function
*/
function loadRemote(remote, req, callback){
  var remote_url = url.parse(remote.url),
      protocol = (remote_url.protocol == 'http:') ? http : https,
      port = remote_url.port,
      headers = req.headers;

  // HACK, REMOVE SOON
  headers['Accept'] = 'application/json';
  headers['X-Requested-By'] = 'XHR';

  // Default port
  if (!port) {
    port = (remote_url.protocol == 'http:') ? 80 : 443;
  }


  // Set up the request
  var remote_request = protocol.request({
      host: remote_url.hostname,
      port: port,
      path: remote_url.path,
      method: remote.method,
      headers: headers
  }, function(res) {
    var data = [],
        contentType = res.headers['content-type'];

    res.on('error', function (err) {
      console.log(err);
      callback.call(this, err);
    });
    res.on('data', function (chunk) {
      data.push(chunk.toString());
    });
    res.on('end', function(){
      data = data.join('');

      // Parse JSON
      if (contentType.toLowerCase().indexOf('json') > -1) {
        data = JSON.parse(data);
      }

      callback.call(this, null, data);
    });
  });
  remote_request.end();
}

/**
  Run the preprocess code for the endpoint

  @param {Object} endpoint The endpoint JSON
  @param {Object} remoteData The data from each remote
  @param {Function} callback A callback function
*/
function runPreprocessing(endpoint, remoteData, callback){
  var preprocess = endpoint.preprocess,
      sandbox;

  // No preprocessing script
  if (!preprocess || preprocess.trim() == '') {
    callback.call(this, remoteData);
    return;
  }

  // Run script in sandbox
  sandbox = {
    'data': {
      'remotes': remoteData
    }
  }
  console.log('Run preprocessing...');
  vm.runInNewContext(preprocess, sandbox, endpoint.id +'.preprocess.js');
  callback.call(this, null, sandbox.data.remotes);
}

/**
  Build the response template

  @param {Object} endpoint The endpoint JSON
  @param {Object} data The data from each remote (might have been modified by runPreprocessing)
  @param {Function} callback A callback function
*/
function buildTemplate(endpoint, remoteData, callback){
  var templateSource = (endpoint.response) ? endpoint.response.template : null,
      remotes = endpoint.remotes,
      template, response;

  // No template. If only one remote, just return the output
  if (!templateSource) {

    if (Object.keys(remotes).length == 1) {
      response = remoteData[Object.keys(remotes)[0]];
      callback.call(this, null, response);
    }
    else {
      callback.call(this, new Error('No templates defined for '+ endpoint.id));
    }

    return;
  }

  // Build template
  console.log('Building template...');
  template = Handlebars.compile(templateSource);
  response = template({
    'data': {
      'remotes': remoteData
    }
  });
  response = response;
  callback.call(this, null, response);
}


/*
  Public APIs
*/
module.exports = Endpoint = {

  /**
    Load all the endpoint paths

    @param {Function} callback  A callback function that gets one argument: err
  */
  loadEndpoints: function(callback){
    console.log('Loading endpoints...');

    readEndpointTree(GLOBAL.endpoint.dir, function(err){
      if (err)
        throw err;
      console.log(util.format('Loaded %d endpoints', Object.keys(allEndpoints).length));
      callback();
    });
  },

  /**
    Return an endpoint by ID

    @param {String} id The endpoint ID
    @param {Function} callback  A callback function that gets two arguments: err and endpoint
  */
  loadEndpoint: function(id, callback) {
    var endpoint = allEndpoints[id];

    if (endpoint) {
      this.loadFromFile(endpoint.file, callback);
    }
    else {
      callback(new Error(util.format('No endpoint for ID %s', id)))
    }
  },

  /**
    Load an endpoint file

    @param {String} path The absolute file path to the endpoint file
    @param {Function} callback  A callback function that gets two arguments: err and endpoint
  */
  loadFromFile: function(filepath, callback) {

    // Doesn't exist
    if (!fs.existsSync(filepath)){
      callback(new Error(util.format('File doesn\'t exist at %s', filepath)))
      return;
    }

    // Read JSON file
    fs.readFile(filepath, function(err, data){
      var json, endpoint;

      if (err) return callback(err);

      // Convert contents to JSON object
      try {
        json = JSON.parse(data);
      } catch(err){
        return callback(err);
      }

      // Return
      if (json.endpoint) {
        return callback(null, json.endpoint);
      }
      // Not valid
      else {
        callback('Not a valid endpoint file');
      }
    });
  },

  /**
    Add an endpoint to the system.

    @param {Object} endpoint JSON representing the endpoint
    @param {Function} callback  A callback function that gets two arguments: err and endpoint
  */
  addEndpoint: function(endpoint, callback){
    var path = endpoint.path || '',
        filename = endpoint.method.toUpperCase() +'.json',
        filepath, json, data;

    // Remove trailing slash
    if (path && path.match(/\/$/) != null) {
      path = path.replace(/\/+$/, '');
    }
    path = path.trim().toLowerCase();

    // Update values
    endpoint.id = endpoint.id.toLowerCase();
    endpoint.path = path;

    // Root URLs are not allowed
    if (path == '') {
      return callback(new Error('Cannot create an endpoint at /'));
    }

    // Create file path
    filepath = fpath.join(GLOBAL.endpoint.dir +'/'+ path);
    if (!fs.existsSync(filepath)){
      try {
        mkdirp.sync(filepath);
      } catch (err){
        return callback(err);
      }
    }

    // Write file
    data = {
      'endpoint': endpoint
    };
    json = JSON.stringify(data);
    fs.writeFile(
      fpath.join(filepath, filename),
      json,
      function(err){
        var id = endpoint.id;
        if (err) {
          return callback(err);
        }

        // Add to endpoint arrays
        allEndpoints[id] = {
          'path': path,
          'file': filepath,
          'id': id
        };
        endpointPaths[id] = path;
        endpointIds[path] = id;

        callback(null, endpoint);
      });
  },

  /**
    Return all the endpoints in an array of objects with the endpoint id, path and method:
      [
        {
          "id": "/store/delivery/regions:GET",
          "path": "/store/delivery/regions",
          "method": "GET"
        }
      }
  */
  getEndpoints: function(){
    var endpoints = [];

    for(var id in allEndpoints) {
      var method = id.split(':')[1],
          endpoint = allEndpoints[id];

      endpoints.push({
        'id': id,
        'path': endpoint.path,
        'method': id.split(':')[1]
      });
    };

    return endpoints;
  },


  /**
    Process the API endpoint and return a response

    @param {Object} json The endpoint as a JSON object
    @parma {Object} req The HTTP request object
    @param {Function} callback A callback function
  */
  process: function (json, req, callback) {
    var endpoint = json.endpoint,
        data = {},
        responses = 0,
        waitTimer = null,
        waitInterval = 50,
        waitCounter = 0,
        timeout = 30000; // 30 seconds

    console.log('Processing endpoint:', endpoint.id);

    if (!endpoint) {
      callback.call(this, new Error('No endpoint defined'));
      return;
    }

    // Load the remotes
    for (var i = 0, len = endpoint.remotes.length; i < len; i++) {
      var remote = endpoint.remotes[i];

      console.log('Connecting to remote', remote.id);
      loadRemote(remote, req, function(err, response){
        responses++;
        if (err){
          callback.call(this, err);
          return;
        }
        data[remote.id] = response;
      });
    }

    // Wait for all remotes to response before continuing
    waitTimer = setInterval(function(){
      waitCounter++;

      // All remotes are in, continue
      if (responses == endpoint.remotes.length) {
        clearInterval(waitTimer);

        // Preprocessing
        runPreprocessing(endpoint, data, function(err, data){
          if (err){
            callback.call(this, err);
            return;
          }

          // Template
          buildTemplate(endpoint, data, function(err, response){
            if (err){
              callback.call(this, err);
              return;
            }
            callback.call(this, null, response);
          });
        });

        return;
      }

      // Timeout
      else if (waitCounter >= timeout / waitInterval){

        // Timeout after 30 seconds
        if (waitCounter > 300) {
          callback.call(this, new Error('Requests to the remotes timed out'))
        }
      }
    }, waitInterval);
  }
};