
var Events;

(function() {

  Events = function() {
    this.listeners = {};
  };

  Events.prototype.on = function(type, callback) {
    if (!this.listeners[type]) {
      this.listeners[type] = [];
    }
    this.listeners[type].push(callback);
    return this;
  };

  Events.prototype.off = function(type, callback) {
    if (this.listeners[type]) {
      this.listeners[type] = this.listeners[type].filter(function(listener) {
        return (listener !== callback);
      });
    }
    return this;
  };

  Events.prototype.emit = function(type, payload) {
    (this.listeners[type] || []).forEach(function(listener) {
      listener(payload);
    });
    return this;
  };

}());
