var fs = require('fs'),
    fpath = require('path'),
    mkdirp = require('mkdirp');

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
   Save an endpoint to file
  */
  router.post('/endpoints', function(req, res) {
    var data = req.body,
        endpoint = data.endpoint,
        path = endpoint.path || '',
        filepath = fpath.join(GLOBAL.endpoint.dir +'/'+ path);
        filename = endpoint.method.toUpperCase() +'.json';

    res.send(200);

    // Remove trailing slash
    if (path && path.match(/\/$/) != null) {
      path = path.replace(/\/+$/, '');
    }
    path = path.trim();

    // Root URLs not allowed
    if (path == '') {
      return res.send('500', 'Cannot create an endpoint at /')
    }

    // Create file path
    if (!fs.existsSync(filepath)){
      try {
        mkdirp.sync(filepath);
      } catch (err){
        return res.send(500, err.toString());
      }
    }

    // Write file
    fs.writeFile(
      fpath.join(filepath, filename),
      JSON.stringify(data),
      function(err){
        if (err) {
          return res.send(500, err);
        }
        res.send(200);
      });
  });
};