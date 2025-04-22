
const raw = await Deno.readTextFile('./takeoffs.geojson')
const json = JSON.parse(raw)

for (const feature of json.features) {
    // console.log(feature.properties.desc);
    const line: string = feature.properties.desc.replaceAll(' | http', '|http')
    const [_, urlsRaw, flights, pilots] = [...line.matchAll(/Url : ([^ ]+) \| Flights: (\d*) \| Pilots: (\d*)/g)][0]
    const properties = {
        name: feature.properties.name,
        url: [...new Set(urlsRaw.split('|').filter(url => url !== 'https://paraglidingspots.com/online/#'))][0] ?? null,
        flights: flights ? parseInt(flights, 10): null,
        pilots: pilots ? parseInt(pilots, 10): null,
    }
    // console.log(properties)
    feature.properties = properties
}

await Deno.writeTextFile('./takeoffs-clean.geojson', JSON.stringify(json, null, 4))