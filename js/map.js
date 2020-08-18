
var map;

$(function(e) {
  map = new OSMBuildings({
    container: 'map',
    position: { latitude: 52.52111, longitude: 13.41078 }, // TODO: could be user's location
    tilt: 30,
    zoom: 16,
    minZoom: 15,
    maxZoom: 20,
    attribution: '© Data <a href="https://openstreetmap.org/copyright/">OpenStreetMap</a> & <a href="https://osmbuildings.org/copyright/">others</a> © Map <a href="https://mapbox.com/">Mapbox</a> © 3D <a href="https://osmbuildings.org/copyright/">OSM Buildings</a>'
  });

  // map.addMapTiles('https://{s}.tiles.mapbox.com/v3/osmbuildings.kbpalbpk/{z}/{x}/{y}.png');
  map.addMapTiles('https://api.mapbox.com/styles/v1/osmbuildings/cjt9gq35s09051fo7urho3m0f/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1Ijoib3NtYnVpbGRpbmdzIiwiYSI6IjNldU0tNDAifQ.c5EU_3V8b87xO24tuWil0w');

  map.addGeoJSONTiles('https://{s}.data.osmbuildings.org/0.2/ph2apjye/tile/{z}/{x}/{y}.json', { fixedZoom: 15 });

  map.on('change', function() {
    app.emit('MAP_CHANGED', getState());
  });

  map.on('pointerup', e => {
    if (!e.features) {
      map.highlight(feature => {});
      hideSidebar();
      return;
    }

    const featureIdList = e.features.map(feature => feature.id);

    map.highlight(feature => {
      if (featureIdList.indexOf(feature.id) > -1) {
        return '#ffcc00';
      }
    });

    showInfoPopup(e.features || []);
  });

  const $resultList = $('#search-results');

  function showInfoPopup(features) {
    $resultList.empty();

    features.forEach(feature => {
      $resultList.append(renderFeatureInfo(feature));
    });

    showSidebar();
  }

  function renderFeatureInfo (feature) {
    let html = '';

    html += '<div class="search-result-type" style="display:inline">ID</div> ';
    html += feature.id + '<br/>';

    for (let key in feature.properties) {
      if (typeof feature.properties[key] === 'object') continue;
      html += '<div class="search-result-type" style="display:inline">' + key + '</div> ';
      html += feature.properties[key] + '<br/>'
    }

    return $('<li>' + html + '</li>');
  }

  app.on('PARAMS_READY', setState);

  app.on('GEOCODE_RESULT', function(data) {
    const targetOffsetSec = Math.round(parseFloat(data.lon) / 180 * 12) * 3600;
    const date = new Date();
    const localOffsetSec = -date.getTimezoneOffset()*60;
    const utcTime = date.getTime();
    date.setTime(utcTime + (targetOffsetSec - localOffsetSec)*1000);

    // console.log(date);
    map.setDate(date);
  }.bind(this));

  app.on('PLACE_SELECTED', function(params) {
    params.zoom = 16;
    setState(params);
  });

  app.emit('MAP_READY', getState());
});

//*****************************************************************************

function setState(data) {
  data = data || {};

  if (data.lat !== undefined && data.lon !== undefined) {
    map.setPosition({ latitude: parseFloat(data.lat), longitude: parseFloat(data.lon) });
  }

  if (data.zoom !== undefined) {
    map.setZoom(parseFloat(data.zoom));
  }

  if (data.rotation !== undefined) {
    map.setRotation(parseFloat(data.rotation));
  }

  if (data.tilt !== undefined) {
    map.setTilt(parseFloat(data.tilt));
  }
}

function getState() {
  const data = {};
  const position = map.getPosition();

  data.lat = parseFloat(position.latitude);
  data.lon = parseFloat(position.longitude);
  data.zoom = parseFloat(this.map.getZoom());

  const rotation = Math.round(map.getRotation());
  if (rotation) {
    data.rotation = rotation;
  }

  const tilt = Math.round(map.getTilt());
  if (tilt) {
    data.tilt = tilt;
  }

  return data;
}
