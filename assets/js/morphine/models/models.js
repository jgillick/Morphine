
/**
  Contains all the details for a morphine API endpoint
*/
Morphine.Endpoint = DS.Model.extend({
  /**
    The URL to this endpoint
  */
  url: DS.attr('string'),

  /**
    The HTTP method: GET, POST, PUT, etc
  */
  method: DS.attr('string'),

  /**
    A remote server definition
  */
  remotes: DS.hasMany('remote', {async:true, embedded:'always'}),

  /**
   JavaScript used to process the data from the remotes before going to the response template
  */
  preprocess: DS.attr('string'),

  /**
   A handlebars template the defines the endpoint response
  */
  response: DS.belongsTo('response', {async:true, embedded:'always'}),

  /**
   Historic remote count.
   This is an index that goes up with every new remote and never goes down.
   It's used to give new remotes a unique ID that should not class with previous remotes that have been added or removed.
  */
  remotes_index: DS.attr('number')
});
Morphine.EndpointSerializer = DS.RESTSerializer.extend({
  extractSingle: function(store, type, payload, id, requestType) {
    console.log('Single?');
    var remotes = payload.endpoint.remotes,
        remoteIds = remotes.mapProperty('id');

    payload.remotes = remotes;
    payload.endpoint.remotes = remoteIds;

    return this._super.apply(this, arguments);
  }
});


/**
  A remote server endpoint
*/
Morphine.Remote = DS.Model.extend({
  /**
    The morphine API endpoint this remote belongs to
  */
  api: DS.belongsTo('endpoint'),

  /**
    The server URL
  */
  url: DS.attr('string'),

  /**
    The HTTP method: GET, POST, PUT, etc
  */
  method: DS.attr('string'),

  /**
    The form data to send to the endpoint
  */
  form_data: DS.attr('string'),

  /**
    Force the mime-type of the response from the server
  */
  mime: DS.attr('string'),

  /**
    Fixture data for this source
  */
  fixture: DS.belongsTo('fixture')

});
// Morphine.DataAdapter.map('Morphine.Remote', {
//   fixture: { embedded: 'always'}
// });

/**
  Defines the fixture for a source or API endpoint
*/
Morphine.Fixture = DS.Model.extend({
  /**
    The format type of the fixture: json, xml
  */
  type: DS.attr('string'),

  /**
    The fixture source
  */
  source: DS.attr('string')

});

/**
  How to respond to the user
*/
Morphine.Response = DS.Model.extend({
  /**
    The response mime-type: text/plain, application/json, etc
  */
  mime: DS.attr('string'),

  /**
    The template containing the body content
  */
  template: DS.attr('string')
});
// Morphine.DataAdapter.map('Morphine.Response', {
//   headers: { embedded: 'always'}
// });