import { style } from "./map-style.js";
import { collection } from "./takeoffs.js";

const map = new maplibregl.Map({
  container: "map",
  style,
  maxZoom: 17,
});

let marker;

const updatePos = (options) => {
  navigator.geolocation.getCurrentPosition((position) => {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    map.setCenter([lon, lat]);

    marker?.remove();
    marker = new maplibregl.Marker({ color: "yellow" })
      .setLngLat([lon, lat])
      .addTo(map);
  }, (error) => {
    console.error(error);
  }, options);
};

document.getElementById("recenter").addEventListener(
  "click",
  () => updatePos({ maximumAge: Infinity }),
);

map.on("load", () => {
  updatePos({ maximumAge: Infinity });

  map.addSource("my-points", {
    type: "geojson",
    data: collection,
  });

  // Add a circle layer to render the points
  map.addLayer({
    id: "points-layer",
    type: "circle",
    source: "my-points",
    paint: {
      "circle-radius": 7,
      "circle-stroke-width": 1,
      "circle-stroke-color": "black",
      "circle-color": [
        "interpolate",
        ["linear"],
        ["get", "flights"],
        0,
        "pink",
        100,
        "red",
      ],
    },
  });

  // Optional: add tooltip/popups
  map.on("click", "points-layer", (e) => {
    const { name, url, flights } = e.features[0].properties;
    new maplibregl.Popup()
      .setLngLat(e.lngLat)
      .setHTML(
        url
          ? `<div><a target="_blank" href="${url}"><strong>${name}</strong></a><div>${
            flights ?? 0
          } vols</div></div>`
          : `<div><strong>${name}</strong><div>${
            flights ?? 0
          } vols</div></div>`,
      )
      .addTo(map);
  });

  // Cursor styling
  map.on("mouseenter", "points-layer", () => {
    map.getCanvas().style.cursor = "pointer";
  });
  map.on("mouseleave", "points-layer", () => {
    map.getCanvas().style.cursor = "";
  });
});

// Optional: add zoom controls
map.addControl(new maplibregl.NavigationControl());
