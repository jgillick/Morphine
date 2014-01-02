var fs = require('fs'),
    fpath = require('path'),
    http = require('http'),
    util = require('util'),
    _ = require('underscore'),
    Endpoint = require('../endpoint');

/**
The Routes for the server UI
*/
module.exports = {


  /**
    Attach all the endpoint routes

    @param {Server} router THe express server object
  */
  routes: function (router, callback) {
    Endpoint.loadEndpoints(function(){

      /**
        Return a list of endpoints and their ID's

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
      */
      router.get('/endpoints', function(req, res){
        var response = {
          'endpoints': Endpoint.getEndpoints()
        }
        console.log(response);

        res.writeHead(200, {"Content-Type": "application/json;charset=UTF-8"});
        res.end(JSON.stringify(response));
      });
    });

    /**
     Handle all requests
    */
    router.all(new RegExp(GLOBAL.endpoint.rootURLPath + '(.*)'), function(req, res){
      var method = req.method.toUpperCase(),
          filename = method +'.json',
          uri = req.params[0],
          filepath = fpath.join(GLOBAL.endpoint.dir, uri, filename),
          contents;

      // No endpoint defined here
      if (!fs.existsSync(filepath)){
        return res.send(404);
      }

      // Read JSON file
      fs.readFile(filepath, function(err, data){
        var json;

        if (err) {
          return res.send(500, err);
        }

        // Convert contents to JSON object
        try {
          json = JSON.parse(data);
        } catch(err){
          console.log(err);
          return res.send(500);
        }

        // Process endpoint
        Endpoint.process(json, req, function(err, data) {
          if (err){
            res.send(500, err);
            return;
          }

          res.writeHead(200, {"Content-Type": "application/json;charset=UTF-8"});
          res.end(data);
        });
      });
    });
  }
};