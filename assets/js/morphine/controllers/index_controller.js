
Morphine.IndexController = Em.ObjectController.extend({

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
      var id = '%@:%@'.fmt(this.get('path'), this.get('method')); // ID = /my/new/endpoint:GET
      this.set('id', id);
      this.get('content').save();
    }
  }
});