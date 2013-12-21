Morphine = Ember.Application.create({
  rootElement: '#endpoint-form',

  /**
   The HTTP methods we support
  */
  http_methods: ['GET', 'POST', 'PUT', 'DELETE'],

  /**
   The mime-types that we know how to read and parse
  */
  supported_mimes: ['text/json', 'text/xml', 'text/plain'],

  /**
    The POST form body encoding we support
  */
  form_encoding: ['form-data', 'x-www-form-unlencoded']
});

/**
  Ember data adapter
*/
Morphine.DataAdapter = DS.RESTAdapter.extend({
  host: 'http://localhost:3000',
  namespace: 'endpoint/'
});
// Morphine.Store = DS.Store.create({
//    adapter: 'Morphine.DataAdapter'
//  });
Ember.Inflector.inflector.uncountable('Headers');

/**
  Add support for DS.attr('array')
  Which is a simple arrays of strings
*/
Morphine.ArrayTransform = DS.Transform.extend({
  deserialize: function(value) {
    return value;
  },
  serialize: function(value) {
    return value;
  }
});

/**
  Add support for DS.attr('hash')
  Which is a key/value object
*/
Morphine.HashTransform = DS.Transform.extend({
  serialize: function(value) {
    if (value) return Em.getProperties(value, Em.get(value, 'propertyName') || []);
  },
  deserialize: function(value) {
    if (value) return Ember.Object.create(value);
  }
});
