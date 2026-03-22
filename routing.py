import networkx as nx
import json

# load stations and connections
with open("stations.json") as f:
    stations = json.load(f)

with open("connections.json") as f:
    connections = json.load(f)

G = nx.Graph()

# add edges
for conn in connections:
    G.add_edge(conn["from"], conn["to"], weight=conn.get("weight",1))

# find shortest path
start = "Times Sq-42 St"
end = "Union Sq-14 St"
path = nx.shortest_path(G, start, end, weight="weight")

print(path) # ['Times Sq-42 St', '34 St-Penn Station', ..., 'Union Sq-14 St']



from flask import Flask, request, jsonify
app = Flask(__name__)

@app.route("/route")
def get_route():
    start = request.args.get("start")
    end = request.args.get("end")
    path = nx.shortest_path(G, start, end, weight="weight")
    return jsonify(path)