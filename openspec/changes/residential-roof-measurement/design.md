# Design

## Context

See proposal.md for motivation and specs/residential-roof-mapping/spec.md for the behavior contract. The current Next.js client page queries ViaCEP, renders the returned address, and builds a Google Maps search URL from CEP history. The residence number is transient client state; no database changes are needed.

## Goals / Non-Goals

**Goals:**
- Add an on-demand, address-specific satellite map and roof-area estimate without persisting new address or geometry data or requiring a paid Google Maps API.
- Keep the existing ViaCEP lookup as the source for street, city, state, and postal code; add the residence number as user-provided input.
- Respect the public geocoder's usage policy and show provider attribution for map tiles.
- Avoid presenting a CEP-level result as an exact property location.

**Non-Goals:**
- Saving roof outlines, coordinates, or measurements to the database or CEP history.
- Automatically detecting roof edges, calculating roof pitch, or estimating photovoltaic capacity.
- Treating satellite imagery as a substitute for field measurements or engineering review.

## Decisions

1. **Geocode on explicit map open through the public Nominatim search endpoint.** Request `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=<encoded-address>` with the complete ViaCEP address and residence number. The user-provided `https://openstreetmap.org{address}` URL is a website URL, not the Nominatim API endpoint. Do not geocode on typing, send only one request per open action, cache successful results in memory, and send the browser's application origin as the HTTP referrer. Do not fall back to the CEP centroid. Nominatim is keyless but rate-limited and best suited here to explicit low-volume lookup; a higher-volume deployment needs a compliant proxy/cache or another geocoder.

2. **Use Leaflet and the Esri World Imagery tile service.** Load the map client-only after a successful CEP lookup, a non-empty residence identifier, and a successful geocode. Use `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}` with a high initial zoom, and include the requested Esri attribution. `https://arcgisonline.com/{z}/{y}/{x}` is not the tile service URL. Alternatives considered: Google Maps requires billing for the requested API workflow; standard OpenStreetMap tiles do not provide satellite imagery.

3. **Keep the residence identifier, coordinates, and measurement transient.** Changing the CEP result or residence number closes the map and clears its polygon so a measurement cannot silently belong to another address. Accept alphanumeric identifiers and `S/N`. Keep CEP history unchanged and identify historical map searches as approximate because they have no house number.

4. **Use native Leaflet and Leaflet Draw for map and editable polygon controls.** Initialize and dispose the map in the client component lifecycle, then enable only polygon creation, editing, and deletion after imagery loads. Compute spherical projected area in square meters with a small provider-independent calculation so the measurement survives the map-provider change.

5. **Keep the workflow in a dedicated client-side map view.** Dynamically load the Leaflet component after the user selects Mapa, with explicit loading, geocoding, imagery, and provider-error states. Show coordinates beside the map and label the result as projected horizontal area in m², with a warning that roof pitch is not included.

## Risks / Trade-offs

- [Nominatim public service has strict usage limits and no availability guarantee] → Geocode only after an explicit user action, avoid autocomplete, cache lookups in memory, and disclose that a higher-volume service needs a compliant geocoder deployment.
- [The geocoder may resolve a street or parcel point rather than the exact roof] → Show coordinates and imagery for visual confirmation; never describe geocoding as guaranteed rooftop precision.
- [Esri imagery can be outdated, low resolution, unavailable, or subject to provider policies] → Preserve the required tile attribution, allow measurement only after tiles load, and label area as a visual estimate.
- [A top-down polygon omits roof slope and can differ from the usable panel area] → Explicitly label it as projected horizontal area and state that inclination and technical validation are excluded.

## Migration Plan

No database migration or API key is required. Remove the Google Maps SDK and unused Google Maps environment variable from runtime requirements; the ignored local `.env.local` file is user-managed and must not be edited or committed. Deploying this approach requires network access to Nominatim and the Esri tile service and compliance with their usage terms. Rollback consists of reverting the client-side map dependencies and component; existing CEP lookup and history data remain unchanged.

## Open Questions

None. The public geocoder and imagery service remain external availability and usage-policy dependencies.