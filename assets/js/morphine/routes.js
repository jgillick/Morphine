Morphine.Router.map(function() {
  this.route('new', { path: '/new' });
  this.route('edit', { path: '/edit/*path' });
});

Morphine.IndexRoute = Em.Route.extend({
  model: function(){
    return this.get('store').find('endpoint');
  },
  setupController: function(controller, model){
    controller.set('content', model);
  }
});

Morphine.NewRoute = Em.Route.extend({
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

Morphine.EditRoute = Em.Route.extend({
  model: function(params) {
    var path = params['path'].replace(/^\//, ''),
        store = this.get('store'),
        endpoint = store.find('endpoint', path);
    return endpoint;
  },
  setupController: function(controller, model) {
    controller.set('content', model);
  }
});