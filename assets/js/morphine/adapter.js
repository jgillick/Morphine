/**
  Ember data adapter
*/
DS.RESTAdapter.reopen({
  host: 'http://localhost:3000',
  namespace: ''
});

/**
  Update serializer handle embedded records
  http://mozmonkey.com/2013/12/serializing-embedded-relationships-ember-data-beta/
  http://mozmonkey.com/2013/12/loading-json-with-embedded-records-into-ember-data-1-0-0-beta/
*/
Morphine.ApplicationSerializer = DS.RESTSerializer.extend({

  /**
   The current ID index of generated IDs
   @property
   @private
  */
  _generatedIds: 0,

  /**
   Sideload a JSON object to the payload

   @method sideloadItem
   @param {Object} payload JSON object representing the payload
   @param {subclass of DS.Model} type The DS.Model class of the item to be sideloaded
   @param {Object} item JSON object representing the record to sideload to the payload
  */
  sideloadItem: function(payload, type, item){
      var sideloadKey = type.typeKey.pluralize(),     // The key for the sideload array
          sideloadArr = payload[sideloadKey] || [],   // The sideload array for this item
          primaryKey = Ember.get(this, 'primaryKey'), // the ID property key
          id = item[primaryKey];

      // Missing an ID, generate one
      if (typeof id == 'undefined') {
          id = 'generated-'+ (++this._generatedIds);
          item[primaryKey] = id;
      }

      // Don't add if already side loaded
      if (sideloadArr.findBy('id', id) != undefined){
          return payload;
      }

      // Add to sideloaded array
      sideloadArr.push(item);
      payload[sideloadKey] = sideloadArr;
      return payload;
  },

  /**
   Extract relationships from the payload and sideload them. This function recursively
   walks down the JSON tree

   @method sideloadItem
   @param {Object} payload JSON object representing the payload
   @paraam {Object} recordJSON JSON object representing the current record in the payload to look for relationships
   @param {Object} recordType The DS.Model class of the record object
  */
  extractRelationships: function(payload, recordJSON, recordType){
      // Loop through each relationship in this record type
      recordType.eachRelationship(function(key, relationship) {
          var related = recordJSON[key], // The record at this relationship
              type = relationship.type;  // belongsTo or hasMany

          if (related){

              // One-to-one
              if (relationship.kind == 'belongsTo') {
                  // Sideload the object to the payload
                  this.sideloadItem(payload, type, related);

                  // Replace object with ID
                  recordJSON[key] = related.id;

                  // Find relationships in this record
                  this.extractRelationships(payload, related, type);
              }

              // Many
              else if (relationship.kind == 'hasMany') {

                  // Loop through each object
                  related.forEach(function(item, index){

                      // Sideload the object to the payload
                      this.sideloadItem(payload, type, item);

                      // Replace object with ID
                      related[index] = item.id;

                      // Find relationships in this record
                      this.extractRelationships(payload, item, type);
                  }, this);
              }

          }
      }, this);

      return payload;
  },


  /**
   Normalized JSON payload before loading into records
  */
  normalizePayload: function(type, payload) {
      var typeKey = type.typeKey,
          typeKeyPlural = typeKey.pluralize();

      payload = this._super(type, payload);

      // Many items (findMany, findAll)
      if (typeof payload[typeKeyPlural] != 'undefined'){
          payload[typeKeyPlural].forEach(function(item, index){
              this.extractRelationships(payload, item, type);
          }, this);
      }

      // Single item (find)
      else if (typeof payload[typeKey] != 'undefined'){
          this.extractRelationships(payload, payload[typeKey], type);
      }

      return payload;
  },

  /**
    Serialize belongsTo relationships from Ember records to JSON
  */
  serializeBelongsTo: function(record, json, relationship) {
    var key = relationship.key,
        belongsTo = Ember.get(record, key);

    key = this.keyForRelationship ? this.keyForRelationship(key, "belongsTo") : key;
    if (belongsTo && relationship.options.embedded === 'always') {
      json[key] = belongsTo.serialize({includeId: true});
    }
    else {
      return this._super(record, json, relationship);
    }
  },

  /**
    Serialize hasMany relationships from Ember records to JSON
  */
  serializeHasMany: function(record, json, relationship) {
    var key = relationship.key,
        hasMany = Ember.get(record, key),
        relationshipType = DS.RelationshipChange.determineRelationshipType(record.constructor, relationship);

    if (relationship.options.embedded === 'always') {
      if (hasMany && relationshipType === 'manyToNone' || relationshipType === 'manyToMany' ||
        relationshipType === 'manyToOne') {

        json[key] = [];
        hasMany.forEach(function(item, index){
          json[key].push(item.serialize({includeId: true}));
        });
      }
    }
    else {
      return this._super(record, json, relationship);
    }
  }
});
