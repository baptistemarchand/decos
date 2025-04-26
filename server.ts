import haversine from "npm:haversine";
import collection from "./takeoffs-clean.json" with { type: "json" };

Deno.serve((req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  const url = new URL(req.url);

  if (
    !url.searchParams.has("all") &&
    (!url.searchParams.has("lat") || !url.searchParams.has("lon"))
  ) {
    console.log("all and (lat or lon) not provider: return 400");
    return new Response(null, { status: 400 });
  }

  const [lat, lon, km, all] = [
    parseFloat(url.searchParams.get("lat")!),
    parseFloat(url.searchParams.get("lon")!),
    parseFloat(url.searchParams.get("km") ?? "20"),
    url.searchParams.get("all"),
  ];

  console.log(`New request`, { lat, lon, km, all });

  const here = { geometry: { coordinates: [lon, lat] } };

  const newFeatures = collection.features.filter((feature) => {
    if (!feature.properties.url || !feature.properties.flights) {
      return false;
    }
    if (all) {
      return true;
    }
    return haversine(here, feature, {
      threshold: km,
      unit: "km",
      format: "geojson",
    });
  });

  return new Response(
    JSON.stringify({
      ...collection,
      features: newFeatures,
    }),
    {
      status: 200,
      headers: {
        "content-type": "application/json; charset=utf-8",
        "Access-Control-Allow-Origin": "*",
      },
    },
  );
});
