Morphine.Router.map(function() {
});

Morphine.IndexRoute = Em.Route.extend({
  model: function() {
    var store = this.get('store'),
        endpoint = store.createRecord('endpoint', {
          'response': store.createRecord('response')
        });
    return endpoint;
  },
  setupController: function(controller, model) {
    controller.set('content', model);
  }
});