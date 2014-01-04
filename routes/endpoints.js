var fs = require('fs'),
    Endpoint = require('../endpoint');

/**
The Routes for the server UI
*/
module.exports = function routes (router) {

  /**
   Index page
  */
  router.get('/', function(req, res){
    res.render('index', {});
  });

  /**
    Return a list of all endpoints and their ID's

    JSON Format:
      {
        "endpoints": [
          {
            "id": "/store/delivery/regions:GET",
            "path": "/store/delivery/regions",
            "method": "GET"
          }
        ]
      }

    GET: /endpoints/
  */
  router.get('/endpoints', function(req, res){
    var response = {
      'endpoints': Endpoint.getEndpoints()
    }

    res.writeHead(200, {"Content-Type": "application/json;charset=UTF-8"});
    res.end(JSON.stringify(response));
  });

  /**
    Return the JSON to an endpoint

    GET: /endpoints/...
  */
  router.get(/\/endpoints\/(.+)/, function(req, res){
    var id = '/'+ req.params[0].toLowerCase();

    Endpoint.loadEndpoint(id, function(err, endpoint){
      if (err) return res.send(500, err.toString());

      var data = {
        'endpoint': endpoint
      };
      res.writeHead(200, {"Content-Type": "application/json;charset=UTF-8"});
      res.end(JSON.stringify(data));
    });
  }),

  /**
   Save an endpoint to file

   POST: /endpoints
  */
  router.post('/endpoints', function(req, res) {
    var data = req.body,
        endpoint = data.endpoint;

    Endpoint.addEndpoint(endpoint, function(err, endpoint){
      var data;
      if (err) return res.send(500, err);

      data = {
        'endpoint': endpoint
      };
      res.writeHead(200, {"Content-Type": "application/json;charset=UTF-8"});
      res.end(JSON.stringify(data));
    });
  });
};