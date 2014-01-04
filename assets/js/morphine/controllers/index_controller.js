
Morphine.IndexController = Em.ArrayController.extend({

  /**
    Get a nested array of directories to endpoints
  */
  tree: function(){
    var endpoints = this.get('content'),
        tree = Ember.Object.create({});

    // Create an object for each path section
    endpoints.forEach(function(endpoint, index) {
      if (endpoint.get('isNew')) return; // don't show new, unsaved, endpoints

      var path = endpoint.get('path').split('/'),
          branch = tree;

      path.forEach(function(filename, index){
        if (filename != '') {
          if (!branch.get(filename)) {
            branch.set(filename, Ember.Object.create({}));
          }
          branch = branch.get(filename);
        }
      });

      branch.set(endpoint.get('method'), endpoint);
    });

    return tree;
  }.property('content', 'content.length', 'content.@each'),

  actions: {

    /**
      Transition to New Endpoint page
    */
    new: function(){
      this.transitionToRoute('new');
    }
  }

});
