LocationManagerClient = class LocationManagerClient {
  constructor() {
    this._current = {};
    this._others = {};
    this._locationId = null;
    this._interval = Meteor.settings.public.location_interval || 60000;
    this._when = new Date(new Date().getTime()+1-this._interval);
  }

  checkIntervalandPost(uid, latLng, addTransform, changeCallback) {
      var tNow = new Date();
      if ((tNow - this._when) > this._interval) {
        if (uid && latLng) {
            if (this._locationId) {
                Locations.update(this._locationId, { $set: latLng });
            } else {
                let prevLocation = Locations.findOne({ uid: uid });
                if (prevLocation) {
                    this._locationId = prevLocation._id;
                    Locations.update(this._locationId, { $set: latLng });
                } else {
                    latLng.uid = uid;
                    this._locationId = Locations.insert(latLng);
                }
            }

            if (Object.keys(this._current).length === 0) {
                this._current.struct = addTransform(latLng);
            }
            changeCallback(this._current.struct, latLng);
        }
      this._when = tNow;
      }
  };

  trackUpdates(tracker, addTransform, changeCallback) {
    tracker.autorun(() => {
      let uid = Meteor.userId(),
          latLng = Geolocation.latLng();
      this.checkIntervalandPost(uid,latLng,addTransform,changeCallback);
    });
  }

  trackOthersUpdates(query, addTransform, changeCallback, removeCallback) {
    this.othersLocations(query).forEach((location) => {
      this._others[location._id] = addTransform(location);
      changeCallback(this._others[location._id], location);
    });
    Locations.find(query).observeChanges({
      changed: (id, fields) => {
        if (id in this._others) {
          removeCallback(this._others[id]);
          changeCallback(this._others[id], fields);
        }
      },
      removed: (id) => {
        if (id in this._others) {
          removeCallback(this._others[id]);
          delete this._others[id];
        }
      },
    });
  }

  currentLocation() {
    return Geolocation.latLng();
  }

  othersLocations(query = {}) {
    if (Meteor.userId()) {
      query.uid = { $ne: Meteor.userId() };
    }
    return Locations.find(query, { fields: { uid: 0 } }).fetch();
  }

  updateUserLocation(location) {
    if (Meteor.userId()) {
      let locationRec = Locations.findOne({uid: Meteor.userId()});
      if (locationRec) {
        Locations.update(location._id, {$set: {lat: location.latitude, lng: location.longitude}});
      } else {
        Locations.insert({lat: location.latitude, lng: location.longitude, uid: Meteor.userId()});
      }
    }
  }
};
