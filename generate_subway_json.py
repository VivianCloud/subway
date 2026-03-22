import csv
import json
from collections import defaultdict

# config: path to extracted gtfs files
STOPS_CSV = "stops.txt"
STOP_TIMES_CSV = "stop_times.txt"
TRIPS_CSV = "trips.txt"

STATIONS_JSON = "stations.json"
CONNECTIONS_JSON = "connections.json"

# load stops.text --> stations
stations = {}

with open(STOPS_CSV, newline='', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        stop_id = row['stop_id']
        name = row['stop_name'].strip()
        lat = float(row['stop_lat'])
        lon = float(row['stop_lon'])
        # basic heuristic for express: major hubs
        express_stops = ["Times Sq", "34 St-Penn", "Grand Central", "Union Sq", 
                         "Fulton St", "Atlantic Av", "14 St-Union Sq", "34 St-Herald Sq"]
        stop_type = "express" if any(e in name for e in express_stops) else "local"

        stations[stop_id] = {
            "name": name,
            "lat": lat,
            "lon": lon,
            "type": stop_type
        }

# Save stations.json
stations_list = list(stations.values())
with open(STATIONS_JSON, "w", encoding="utf-8") as f:
    json.dump(stations_list, f, indent=2)
print(f"{STATIONS_JSON} created with {len(stations_list)} stations.")

# ----------------------------
# Build connections.json from stop_times.txt + trips.txt
# ----------------------------

# Load trips to know which trip_id corresponds to which route (optional, can skip)
trip_ids = set()
with open(TRIPS_CSV, newline='', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        trip_ids.add(row['trip_id'])

# Build adjacency set
connections_set = set()

# Read stop_times
# For each trip, add consecutive stops as connections
trips_stops = defaultdict(list)  # trip_id -> list of (stop_sequence, stop_id)

with open(STOP_TIMES_CSV, newline='', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        trip_id = row['trip_id']
        if trip_id not in trip_ids:
            continue
        stop_id = row['stop_id']
        seq = int(row['stop_sequence'])
        trips_stops[trip_id].append((seq, stop_id))

# Build connections
for trip_id, stops in trips_stops.items():
    stops.sort()
    stop_ids = [s[1] for s in stops]
    for i in range(len(stop_ids) - 1):
        a = stations[stop_ids[i]]['name']
        b = stations[stop_ids[i+1]]['name']
        if a != b:
            # store sorted tuple to avoid duplicates
            connections_set.add(tuple(sorted([a,b])))

# Save connections.json
connections_list = [{"from": a, "to": b} for a,b in connections_set]
with open(CONNECTIONS_JSON, "w", encoding="utf-8") as f:
    json.dump(connections_list, f, indent=2)
print(f"{CONNECTIONS_JSON} created with {len(connections_list)} connections.")