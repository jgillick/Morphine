
/**
  Main endpoint editor controller
*/
Morphine.EditController = Em.ObjectController.extend({
  needs: ['index'],

  indexController: null,
  indexControllerBinding: 'controllers.index',

  isNew: false,

  actions: {
    /**
      Add remote to the morphine API endpoint
    */
    addRemote: function(){
      var remotes = this.get('remotes'),
          method = this.get('method'),
          index = this.get('remotesIndex'),
          newRemote;

      // Create new remote
      index++;
      newRemote = this.get('store').createRecord('remote', {
            'method': method,
            'id': 'remote%@'.fmt(index)
        })
      remotes.addObject(newRemote);

      this.set('content.remotes', remotes);
      this.set('content.remotesIndex', index);
      return newRemote
    },

    /**
      Save the API endpoint
    */
    save: function(){
      var id = '%@:%@'.fmt(this.get('path'), this.get('method')).toLowerCase(); // ID = /my/new/endpoint:GET
      this.set('id', id);
      this.get('content').save().then(function(){
        console.log('Saved', this.get('indexController'));
      });
    }
  }
});

/**
  New endpoint editor
*/
Morphine.NewController = Morphine.EditController.extend({
  isNew: true
})