Morphine.Router.map(function() {
});

Morphine.IndexRoute = Em.Route.extend({
  model: function() {
    var store = this.get('store');
    var endpoint = store.createRecord('endpoint', {'remotesIndex': 0});
    return endpoint;
  },
  setupController: function(controller, model) {
    controller.set('content', model);
  }
});