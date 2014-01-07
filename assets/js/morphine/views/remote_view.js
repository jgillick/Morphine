
/**
  Defines the UI for adding/editing a remote server
*/
Morphine.RemoteView = Em.View.extend({
  templateName: 'edit_remote',
  classNames: ['remote'],

  /**
    True if the selected method is GET

    @property
  */
  isMethodGET: function(){
    return this.get('context.method') == 'GET';
  }.property('context.method'),

  actions: {

    /**
      Remove this remote from the remotes list

      @method
    */
    remove: function(){
      this.get('context').deleteRecord();
    }
  }
});