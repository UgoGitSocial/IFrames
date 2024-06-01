L.AnimatedMarker = L.Marker.extend({
  options: {
    distance: 200,  // meters
    interval: 1000,  // milliseconds
    autoStart: true,
    onEnd: function(){},
    clickable: false
  },

  initialize: function (latlngs, options) {
    this.setLine(latlngs);
    L.Marker.prototype.initialize.call(this, latlngs[0], options);
  },

  _chunk: function(latlngs) {
    var i, len = latlngs.length, chunkedLatLngs = [];
    for (i = 1; i < len; i++) {
      var cur = latlngs[i-1], next = latlngs[i], dist = cur.distanceTo(next), factor = this.options.distance / dist,
        dLat = factor * (next.lat - cur.lat), dLng = factor * (next.lng - cur.lng);

      if (dist > this.options.distance) {
        while (dist > this.options.distance) {
          cur = new L.LatLng(cur.lat + dLat, cur.lng + dLng);
          dist = cur.distanceTo(next);
          chunkedLatLngs.push(cur);
        }
      } else {
        chunkedLatLngs.push(cur);
      }
    }
    chunkedLatLngs.push(latlngs[len - 1]);
    return chunkedLatLngs;
  },

  onAdd: function (map) {
    L.Marker.prototype.onAdd.call(this, map);
    if (this.options.autoStart) {
      this.start();
    }
  },

  animate: function() {
    var self = this, len = this._latlngs.length, speed = this.options.interval, map = this._map;

    if (this._i < len && this._i > 0) {
      speed = this._latlngs[this._i - 1].distanceTo(this._latlngs[this._i]) / this.options.distance * this.options.interval;
    }

    speed *= 1.5;  // Slow down the animation

    if (L.DomUtil.TRANSITION) {
      if (this._icon) { this._icon.style[L.DomUtil.TRANSITION] = 'all ' + speed + 'ms linear'; }
      if (this._shadow) { this._shadow.style[L.DomUtil.TRANSITION] = 'all ' + speed + 'ms linear'; }
    }

    this.setLatLng(this._latlngs[this._i]);
    this._i++;

    map.setView(this.getLatLng(), 10, { animate: true, duration: 0.5 });  // Set zoom level and animate

    this._tid = setTimeout(function(){
      if (self._i === len) {
        self.options.onEnd.apply(self, Array.prototype.slice.call(arguments));
      } else {
        self.animate();
      }
    }, speed);
  },

  start: function() {
    this.animate();
  },

  stop: function() {
    if (this._tid) {
      clearTimeout(this._tid);
    }
  },

  setLine: function(latlngs){
    if (L.DomUtil.TRANSITION) {
      this._latlngs = latlngs;
    } else {
      this._latlngs = this._chunk(latlngs);
      this.options.distance = 10;
      this.options.interval = 30;
    }
    this._i = 0;
  }
});

L.animatedMarker = function (latlngs, options) {
  return new L.AnimatedMarker(latlngs, options);
};
