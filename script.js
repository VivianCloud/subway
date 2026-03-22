// Initialize map
var map = L.map('map').setView([40.7128, -74.0060], 12);

// Add tiles
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19
}).addTo(map);

var startSelect = document.getElementById("start");
var endSelect = document.getElementById("end");
var drawBtn = document.getElementById("drawBtn");

var stations = [];
var connections = [];
var routeLine;

// Create marker cluster
var markers = L.markerClusterGroup();

// Fetch stations
fetch("stations.json")
  .then(res => res.json())
  .then(data => {
      stations = data;

      // Add markers & dropdown options
      stations.forEach(station => {
          var marker = L.circleMarker([station.lat, station.lon], {
              radius: 5,
              color: 'blue',
              fillColor: 'blue',
              fillOpacity: 0.7
          }).bindTooltip(station.name, {permanent:false, direction:'top'});

          markers.addLayer(marker);

          // Add to dropdowns
          [startSelect, endSelect].forEach(select => {
              var option = document.createElement("option");
              option.value = station.name;
              option.text = station.name;
              select.add(option);
          });
      });

      map.addLayer(markers);
  });

// Fetch connections
fetch("connections.json")
  .then(res => res.json())
  .then(data => { connections = data; });

// Simple Dijkstra algorithm in JS
function findShortestPath(start, end) {
    // Build adjacency list
    const graph = {};
    stations.forEach(s => graph[s.name] = []);
    connections.forEach(c => {
        graph[c.from].push(c.to);
        graph[c.to].push(c.from); // undirected
    });

    // BFS for shortest path (unweighted)
    const queue = [[start]];
    const visited = new Set();

    while(queue.length > 0){
        const path = queue.shift();
        const node = path[path.length-1];
        if(node === end) return path;
        if(visited.has(node)) continue;
        visited.add(node);
        for(const neighbor of graph[node]){
            queue.push([...path, neighbor]);
        }
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