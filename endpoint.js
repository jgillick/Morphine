
/**
  API endpoint processor
*/
var http = require('http'),
    https = require('https'),
    util = require('util'),
    url = require('url'),
    vm = require('vm'),
    Handlebars = require('handlebars'),
    querystring = require('querystring');

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
module.exports = {

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