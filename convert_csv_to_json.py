import csv
import json
stations_list = []

with open("MTA_Subway_Stations_20260321.csv", newline='',encoding='utf-8') as csvfile:
    reader = csv.DictReader(csvfile)
    for row in reader:
        stations_list.append({
            "name": row["Stop Name"],
            "lat": float(row["GTFS Latitude"]),
            "lon": float(row["GTFS Longitude"])
        })

with open("stations.json", "w") as jsonfile:
    json.dump(stations_list, jsonfile, indent=2)

print("stations.json created successfully!")