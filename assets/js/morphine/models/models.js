
/**
  Contains all the details for a morphine API endpoint
*/
Morphine.Endpoint = DS.Model.extend({
  /**
    The URL to this endpoint
  */
  path: DS.attr('string', {defaultValue: 'TEST/PATH'}),

  /**
    The HTTP method: GET, POST, PUT, etc
  */
  method: DS.attr('string', {defaultValue: 'GET'}),

  /**
    A remote server definition
  */
  remotes: DS.hasMany('remote', {embedded:'always'}),

  /**
   Historic remote count.
   This is an index that goes up with every new remote and never goes down.
   It's used to give new remotes a unique ID that should not class with previous remotes that have been added or removed.
  */
  remotesIndex: DS.attr('number', {defaultValue: 0}),

  /**
   JavaScript used to process the data from the remotes before going to the response template
  */
  preprocess: DS.attr('string'),

  /**
   A handlebars template the defines the endpoint response
  */
  response: DS.belongsTo('response', {embedded:'always'})
});


/**
  A remote server endpoint
*/
Morphine.Remote = DS.Model.extend({

  /**
    The morphine API endpoint this remote belongs to
  */
  endpoint: DS.belongsTo('endpoint'),

  /**
    The server URL
  */
  url: DS.attr('string', {defaultValue: 'http://test.com/api/url'}),

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
  fixture: DS.attr('string', {defaultValue: 'ARE YOUR BASE BELONGS TO US'})

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