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
