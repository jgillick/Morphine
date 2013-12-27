
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
      this.set('content.remotes_index', index);
      return newRemote
    },

    /**
      Save the API endpoint
    */
    save: function(){
      console.log(this.get('content.response.template'));
      this.get('content').save();
    }
  }
});