import json
from shapely.geometry import shape
from pathlib import Path
import os
 

print("current working directory:", os.getcwd())

def normalize_name(name):
    return name.lower().strip().replace("’", "'")

# Load original GeoJSON file
with open("restaurants.geojson", "r", encoding="utf-8") as f:
    data = json.load(f)

seen_keys = set()
cleaned_features = []
cuisine_list = []

for feature in data["features"]:
    props = feature["properties"]
    name = normalize_name(props.get("name", ""))
    coords = shape(feature["geometry"]).centroid.coords[0]
    rounded_coords = (round(coords[0], 5), round(coords[1], 5))
    
    key = (name, rounded_coords)
    if key not in seen_keys:
        seen_keys.add(key)
        existing = props.get("cuisine", "")
        props["cuisine"] = existing.strip().replace("_"," ")    
        cleaned_features.append(feature)
        cuisine_list.append(props["cuisine"])
        
# Save cleaned GeoJSON
cleaned_data = {
    "type": "FeatureCollection",
    "features": cleaned_features
}

list_of_cuisines = {
    "type": "CusineList",
    "cuisines": cuisine_list
}

with open("cuisines.geojson", "w", encoding="utf-8") as f:
    json.dump(cleaned_data, f, ensure_ascii=False, indent=2)
    
with open("cuisineslist.geojson", "w", encoding="utf-8") as f:
    json.dump(list_of_cuisines, f, ensure_ascii=False, indent=2)

print(f"Saved {len(cleaned_features)} cleaned restaurant features.")


