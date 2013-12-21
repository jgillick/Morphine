module.exports = function(assets) {
  assets.addJs(__dirname + '/public/js/lib/jquery.js');
  assets.addJs(__dirname + '/public/js/lib/handlebars.js');
  assets.addJs(__dirname + '/public/js/lib/ember.js');
  assets.addJs(__dirname + '/public/js/lib/ember-data.js');

  assets.addJs(__dirname + '/public/js/morphine/morphine.js');
  assets.addJs(__dirname + '/public/js/morphine/**');
};