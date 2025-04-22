import haversine from "npm:haversine";
import collection from "./takeoffs-clean.json" with { type: "json" };

Deno.serve((req) => {
  const url = new URL(req.url);
  const [lat, lon, km] = [
    parseFloat(url.searchParams.get("lat")!),
    parseFloat(url.searchParams.get("lon")!),
    parseFloat(url.searchParams.get("km") ?? "20"),
  ];

  const here = { geometry: { coordinates: [lon, lat] } };

  const points = collection.features.filter((feature) =>
    haversine(here, feature, { threshold: km, unit: "km", format: "geojson" })
  );

  return new Response(JSON.stringify(points), {
    status: 200,
    headers: {
      "content-type": "application/json; charset=utf-8",
    },
  });
});
