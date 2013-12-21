
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
      remotes.pushObject(newRemote);

      this.set('content.remotes', remotes);
      this.set('content.remotesIndex', index);
      return newRemote
    },

    /**
      Save the API endpoint
    */
    save: function(){
      // console.log(this.get('remotes').objectAt(0).toJSON());
      console.log(this.get('content.remotesIndex'));
      this.get('content').save();
    }
  }
});