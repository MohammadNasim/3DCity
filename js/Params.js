
function Params() {
  this.data = {};

  if (location.search) {
    var query = location.search.substring(1);
    query.replace(/(?:^|&)([^&=]*)=?([^&]*)/g, function($0, $1, $2) {
      if ($1) {
        this.data[$1] = decodeURIComponent($2);
      }
    }.bind(this));
  }

  app.emit('PARAMS_READY', this.data);

  app.on('MAP_CHANGED', function(params) {
    for (var key in params) {
      this.data[key] = params[key];
    }
    this.save();
  }.bind(this));
}

Params.prototype.save = function() {
  if (!history.replaceState) {
    return;
  }

  clearTimeout(this.timer);
  this.timer = setTimeout(function() {
    var query = [], val;
    for (var key in this.data) {
      val = this.data[key];
      switch (key) {
        case 'lat':
        case 'lon':
          val = val.toFixed(5);
        break;
        case 'zoom':
          val = val.toFixed(1);
        break;
      }
      query.push(encodeURIComponent(key) + '=' + encodeURIComponent(val));
    }
    history.replaceState(null, '', '?' + query.join('&'));
  }.bind(this), 500);
};
