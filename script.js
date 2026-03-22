// Initialize map
var map = L.map('map').setView([40.7128, -74.0060], 12);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);

var startSelect = document.getElementById("start");
var endSelect = document.getElementById("end");
var drawBtn = document.getElementById("drawBtn");

var stations = [];
var connections = [];
var routeLine;

var allMarkers = []; // store markers with station type

// Load stations
fetch("stations.json")
  .then(res => res.json())
  .then(data => {
      stations = data;

      stations.forEach(station => {
          var marker = L.circleMarker([station.lat, station.lon], {
              radius: 4,
              color: 'blue',
              fillColor: 'blue',
              fillOpacity: 0.7
          }).bindTooltip(station.name, {permanent:false, direction:'top'});

          allMarkers.push({marker: marker, type: station.type});

          // Add to dropdowns
          [startSelect, endSelect].forEach(select => {
              var option = document.createElement("option");
              option.value = station.name;
              option.text = station.name;
              select.add(option);
          });
      });

      updateMarkers(); // show markers initially
  });

// Load connections
fetch("connections.json")
  .then(res => res.json())
  .then(data => { connections = data; });

// Zoom-dependent visibility
function updateMarkers() {
    var zoom = map.getZoom();

    allMarkers.forEach(obj => {
        if (zoom < 14) {
            // low zoom: only show express stops
            if (obj.type === "express") {
                if (!map.hasLayer(obj.marker)) map.addLayer(obj.marker);
            } else {
                if (map.hasLayer(obj.marker)) map.removeLayer(obj.marker);
            }
        } else {
            // zoom >= 14: show all stations
            if (!map.hasLayer(obj.marker)) map.addLayer(obj.marker);
        }
    });
}

// Update markers on zoom
map.on('zoomend', updateMarkers);

// Simple BFS for shortest path
function findShortestPath(start, end) {
    const graph = {};
    stations.forEach(s => graph[s.name] = []);
    connections.forEach(c => {
        graph[c.from].push(c.to);
        graph[c.to].push(c.from);
    });

    const queue = [[start]];
    const visited = new Set();

    while(queue.length > 0) {
        const path = queue.shift();
        const node = path[path.length-1];
        if(node === end) return path;
        if(visited.has(node)) continue;
        visited.add(node);
        for(const neighbor of graph[node]) queue.push([...path, neighbor]);
    }
    return null;
}

// Draw route
drawBtn.addEventListener("click", () => {
    const start = startSelect.value;
    const end = endSelect.value;
    if(!start || !end){ alert("Select both stations"); return; }

    const path = findShortestPath(start, end);
    if(!path){ alert("No route found"); return; }

    const coords = path.map(name => {
        const s = stations.find(x => x.name===name);
        return [s.lat, s.lon];
    });

    if(routeLine) map.removeLayer(routeLine);
    routeLine = L.polyline(coords, {color:'red', weight:5}).addTo(map);
    map.fitBounds(routeLine.getBounds());
});