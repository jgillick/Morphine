/**
  Load all the server routes
*/
exports.attachHandlers = function attachHandlers (server) {
  require('./ui')(server);
  require('./endpoints').routes(server);
};