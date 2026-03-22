// Initialize the map
var map = L.map('map').setView([40.7128, -74.0060], 12);

// Add tiles
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19
}).addTo(map);

var startSelect = document.getElementById("start");
var endSelect = document.getElementById("end");
var drawBtn = document.getElementById("drawBtn");

var stations = []; // will hold JSON data
var routeLine;     // global for route line

// Load stations from JSON
fetch("stations.json")
  .then(response => response.json())
  .then(data => {
      stations = data;

      // Add markers and populate dropdowns
      stations.forEach(station => {
            // Marker
            L.circleMarker([station.lat, station.lon], {
                radius: 5,        // small size
                color: 'blue',    // border color
                fillColor: 'blue',// fill color
                fillOpacity: 0.7
            }).addTo(map)
              .bindTooltip(station.name, {permanent: false, direction: 'top'});

          // Start dropdown
          var optionStart = document.createElement("option");
          optionStart.value = station.name;
          optionStart.text = station.name;
          startSelect.add(optionStart);

          // End dropdown
          var optionEnd = document.createElement("option");
          optionEnd.value = station.name;
          optionEnd.text = station.name;
          endSelect.add(optionEnd);
      });
  })
  .catch(err => console.error("Error loading stations:", err));

// Draw route function
function drawRoute() {
    var startName = startSelect.value;
    var endName = endSelect.value;

    if (!startName || !endName) {
        alert("Please select both start and end stations.");
        return;
    }

    var startStation = stations.find(s => s.name === startName);
    var endStation = stations.find(s => s.name === endName);

    if (routeLine) {
        map.removeLayer(routeLine);
    }

    routeLine = L.polyline(
        [[startStation.lat, startStation.lon], [endStation.lat, endStation.lon]],
        { color: 'red', weight: 5 }
    ).addTo(map);

    map.fitBounds(routeLine.getBounds());
}

// Attach button event
drawBtn.addEventListener("click", drawRoute);