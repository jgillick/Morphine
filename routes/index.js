/**
  Load all the server routes
*/
exports.attachHandlers = function attachHandlers (server) {
  require('./endpoints')(server);
  require('./api').routes(server);
};