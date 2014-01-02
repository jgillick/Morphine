
/**
  Lists the endpoints in a directory view
*/
Morphine.EndpointTree = Em.View.extend({
  templateName: 'endpoint_tree',
  tree: null,
  directories: [],
  endpoints: [],

  didInsertElement: function(){
    this.organizeTree();
  },

  /**
    Split up the tree into directories and endpoints

    @method organizeTree
  */
  organizeTree: function(){
    var dirs = [],
        endpoints = [],
        tree = this.get('tree'),
        files = Ember.keys(tree);

    if (!tree) return;

    for(var i = 0, len = files.length; i < len; i++) {
      var key = files[i],
          leaf = tree[key];

      // Directory
      if (leaf.constructor === Ember.Object) {
        dirs.push({
          'name': key,
          'children': leaf
        })
      }
      // Endpoint
      else if (leaf.constructor.typeKey === 'endpoint') {
        endpoints.push({
          'name': key.toUpperCase(),
          'endpoint': leaf
        });
      }
    }

    this.set('directories', dirs);
    this.set('endpoints', endpoints);
  }.observes('tree', 'tree.@each'),

  /**
    List of directories at this level
  */
  zdirectories: function(){

  }.property('tree'),

  /**
    List of endpoints at this level
  */
  zendpoints: function(){
    var endpoints = [],
        tree = this.get('tree'),
        branch;

    if (!tree) return;

    for(var prop in tree) if (tree.hasOwnProperty(prop)) {
      branch = tree[prop];
      console.log(prop, typeof branch);
    }

    return endpoints;
  }.property('tree')
});