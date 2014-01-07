Morphine = Ember.Application.create({
  rootElement: '#morphine-ui',

  /**
   The HTTP methods we support
  */
  http_methods: ['GET', 'POST', 'PUT', 'DELETE'],

  /**
   The mime-types that we know how to read and parse
  */
  supported_mimes: ['json', 'xml', 'text'],

});
