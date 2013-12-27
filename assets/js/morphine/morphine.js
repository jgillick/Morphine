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
DS.RESTAdapter.reopen({
  host: 'http://localhost:3000',
  namespace: ''
});
// Morphine.Store = DS.Store.create({
//    adapter: 'Morphine.DataAdapter'
//  });
Ember.Inflector.inflector.uncountable('Headers');

/**
  Update serializer to add embedded records
  http://mozmonkey.com/2013/12/serializing-embedded-relationships-ember-data-beta/
*/
DS.RESTSerializer.reopen({
  serializeBelongsTo: function(record, json, relationship) {
    var key = relationship.key,
        belongsTo = Ember.get(record, key);

    key = this.keyForRelationship ? this.keyForRelationship(key, "belongsTo") : key;
    if (belongsTo && relationship.options.embedded === 'always') {
      json[key] = belongsTo.serialize();
    }
    else {
      return this._super(record, json, relationship);
    }
  },
  serializeHasMany: function(record, json, relationship) {
    var key = relationship.key,
        hasMany = Ember.get(record, key),
        relationshipType = DS.RelationshipChange.determineRelationshipType(record.constructor, relationship);

    if (relationship.options.embedded === 'always') {
      if (hasMany && relationshipType === 'manyToNone' || relationshipType === 'manyToMany' ||
        relationshipType === 'manyToOne') {

        json[key] = [];
        hasMany.forEach(function(item, index){
          json[key].push(item.serialize());
        });
      }
    }
    else {
      return this._super(record, json, relationship);
    }
  }
});