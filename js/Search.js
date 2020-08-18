
function Search($container) {
  this.$resultList = $('#search-results');

  this.$inputField = $container.find('input');
  this.$inputField.keydown(function(e) {
    if (e.keyCode !== 13) {
      return;
    }
    var query = this.$inputField.val();
    if (query) {
      this.$inputField.blur(); // for iOS in order to close the keyboard
      this.search(query);
    }
    e.preventDefault();
  }.bind(this));

  $('#search-trigger-button').click(function(e) {
    var query = this.$inputField.val();
    if (query) {
      this.search(query);
    }
  }.bind(this));

  this.position = {};
  app.on('PARAMS_READY', function(params) {
    // do initial search
    if (params.q) {
      this.$inputField.val(params.q);
      this.search(params.q);
      return;
    }

    // do initial geocoding
    if (params.lat !== undefined && params.lon !== undefined) {
      this.position = { lat: params.lat, lon: params.lon };
      this.geocode(this.position);
    }
  }.bind(this));

  app.on('MAP_CHANGED', function(params) {
    if (this.position === undefined || geoDistance(this.position, params)>10) {
      this.geocode(this.position);
    }
  }.bind(this));
}

Search.SEARCH_URL = 'https://nominatim.openstreetmap.org/search?format=json&polygon_geojson=1&limit=5&q={query}';
Search.GEOCODE_URL = 'https://nominatim.openstreetmap.org/reverse?format=json&lat={lat}&lon={lon}&zoom=18&addressdetails=1';

Search.prototype = {};

Search.prototype.search = function(query) {
  this.$resultList.empty();
  this.isLoading = true;
  $.ajax(Search.SEARCH_URL.replace('{query}', encodeURIComponent(query))).done(function(res) {
    this.isLoading = false;
    this.showResults(res);
  }.bind(this));
};

Search.prototype.selectResult = function(item) {
  this.position = { lat: item.lat, lon: item.lon };
  this.geocode(this.position);
  app.emit('PLACE_SELECTED', item);
};

Search.prototype.showResults = function(res) {
  // this.$resultList.empty();

  if (!res.length) {
    $('<li class="search-error">no results</li>').appendTo(this.$resultList);
    app.emit('SEARCH_ERROR');
    return;
  }

  res.forEach(function(item) {
    var type = item.class === 'place' ? item.type : item.type + ' ' + item.class;
    $('<li><a href="#">' + item.display_name + '</a><div class="search-result-type">' + type + '</div></li>')
      .appendTo(this.$resultList).click(function(e) {
        this.selectResult(item);
      }.bind(this));
  }.bind(this));
  if (res.length) {
    this.selectResult(res[0]);
  }

  app.emit('SEARCH_RESULT', res);
};

Search.prototype.geocode = function(position) {
  if (this.isLoading) {
    return;
  }
  this.isLoading = true;
  $.ajax(Search.GEOCODE_URL.replace('{lat}', position.lat).replace('{lon}', position.lon)).done(function(res) {
    this.isLoading = false;
    if (res) {
      app.emit('GEOCODE_RESULT', res);
    }
  }.bind(this));
};

//***************************************************************************

function geoDistance(a, b) {
  var
    radlat1 = Math.PI*a.lat/180,
    radlat2 = Math.PI*b.lat/180,
    theta = a.lon - b.lon,
    radtheta = Math.PI*theta/180,
    dist = Math.sin(radlat1)*Math.sin(radlat2) + Math.cos(radlat1)*Math.cos(radlat2)*Math.cos(radtheta);
  dist = Math.acos(dist);
  dist = dist*180/Math.PI;
  dist = dist*60*1.1515;
  dist = dist*1.609344; // kilometers
  return dist;
}