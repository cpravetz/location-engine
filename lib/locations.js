import SimpleSchema from 'simpl-schema';

Locations = new Mongo.Collection('locations');

Locations.allow({
  insert: function() {
    return true;
  },
  update: function() {
    return true;
  },
  remove: function() {
    return true;
  }
});

Locations.attachSchema(new SimpleSchema({
  uid: {
    type: String,
    min: 17,
    max: 17,
    label: 'user id'
  },
  lat: {
    type: Number,
    //decimal: true,
    min: -90,
    max: 90
  },
  lng: {
    type: Number,
    //decimal: true,
    min: -180,
    max: 180
  },
  when: {
    type: Date,
    optional: true
  }
}));

if (Meteor.isServer) {
  Meteor.publish('locations', function() {
    return Locations.find();
  });
}
