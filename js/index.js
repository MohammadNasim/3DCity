
var app = new Events();

$(function() {
  new Search($('#search'));
  new Params();

  $('#sidebar-toggle-button').click(function() {
    if ($('#search').hasClass('with-sidebar')) {
      hideSidebar();
    } else {
      showSidebar();
    }
  });
});

app.on('SEARCH_ERROR', showSidebar);
app.on('SEARCH_RESULT', showSidebar);

app.on('GEOCODE_RESULT', function(data) {
  if (data && data.address) {
    var address = data.address;
    var name = (address.city || address.state) +' ('+ address.country_code.toUpperCase() + ')';
    document.title = (name ? name + ' • ' : '') + 'OSM Buildings';
  }
});

function hideSidebar() {
  $('#sidebar').fadeOut();
  $('#search').removeClass('with-sidebar');
  $('#sidebar-toggle-button').html('&#xf0c9;');
}

function showSidebar() {
  $('#sidebar').fadeIn();
  $('#search').addClass('with-sidebar');
  $('#sidebar-toggle-button').html('&times;');
}
