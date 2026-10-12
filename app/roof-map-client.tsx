"use client";

import { useEffect, useRef, useState } from "react";
import type * as Leaflet from "leaflet";

import { calculateRoofArea, type RoofVertex } from "../domain/roof-measurement";
import {
  geocodeResidentialAddress,
  NominatimRateLimitError,
  NominatimServiceError,
  ResidentialAddressNotFoundError,
  ResidentialNumberRequiredError,
  type Coordinates,
  type ResidentialAddress,
} from "../infrastructure/maps/nominatim-client";

type RoofMapProps = {
  address: ResidentialAddress;
  residenceNumber: string;
};

type MapStatus = "loading" | "ready" | "error";
type LeafletApi = typeof import("leaflet");

const imageryTiles = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
const imageryAttribution = "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community";

function getPolygonArea(layer: Leaflet.Polygon, leaflet: LeafletApi): number | null {
  const firstRing = layer.getLatLngs()[0];
  if (!Array.isArray(firstRing)) return null;

  const vertices: RoofVertex[] = (firstRing as Leaflet.LatLng[]).map(({ lat, lng }) => ({ lat, lng }));
  return calculateRoofArea(vertices, (points) => leaflet.GeometryUtil.geodesicArea([...points]));
}

export default function RoofMap({ address, residenceNumber }: RoofMapProps) {
  const mapElement = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<MapStatus>("loading");
  const [error, setError] = useState("");
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [tilesLoaded, setTilesLoaded] = useState(false);
  const [tilesUnavailable, setTilesUnavailable] = useState(false);
  const [area, setArea] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    let map: Leaflet.Map | undefined;
    let control: Leaflet.Control.Draw | undefined;
    let featureGroup: Leaflet.FeatureGroup | undefined;
    let tileTimeout: number | undefined;
    let hasLoadedTiles = false;
    let onMapCreated: Leaflet.LeafletEventHandlerFn | undefined;
    let onMapEdited: Leaflet.LeafletEventHandlerFn | undefined;
    let onMapDeleted: Leaflet.LeafletEventHandlerFn | undefined;

    void geocodeResidentialAddress(address, residenceNumber)
      .then(async (location) => {
        const leafletModule = await import("leaflet");
        if (cancelled || !mapElement.current) return;
        const L = (leafletModule as unknown as { default: LeafletApi }).default;

        setCoordinates(location);
        setStatus("ready");
        map = L.map(mapElement.current, {
          zoomControl: true,
          scrollWheelZoom: false,
          attributionControl: true,
        }).setView([location.lat, location.lng], 19);

        const imagery = L.tileLayer(imageryTiles, {
          maxNativeZoom: 19,
          maxZoom: 21,
          attribution: imageryAttribution,
        });

        imagery.once("load", () => {
          if (cancelled || !map) return;
          hasLoadedTiles = true;
          setTilesLoaded(true);
          if (tileTimeout !== undefined) window.clearTimeout(tileTimeout);

          (globalThis as typeof globalThis & { L: LeafletApi }).L = L;
          void import("leaflet-draw").then(() => {
            if (cancelled || !map) return;

            featureGroup = new L.FeatureGroup().addTo(map);
            control = new L.Control.Draw({
              position: "topright",
              draw: {
                polygon: {
                  allowIntersection: false,
                  showArea: false,
                  shapeOptions: {
                    color: "#e87932",
                    weight: 3,
                    fillColor: "#f59e0b",
                    fillOpacity: 0.22,
                  },
                },
                polyline: false,
                rectangle: false,
                circle: false,
                circlemarker: false,
                marker: false,
              },
              edit: { featureGroup, edit: {}, remove: true },
            });
            map.addControl(control);

            onMapCreated = (rawEvent) => {
              const event = rawEvent as Leaflet.DrawEvents.Created;
              if (!featureGroup || event.layerType !== "polygon" || !(event.layer instanceof L.Polygon)) return;
              featureGroup.clearLayers();
              featureGroup.addLayer(event.layer);
              const measuredArea = getPolygonArea(event.layer, L);
              if (measuredArea === null) {
                featureGroup.removeLayer(event.layer);
                setError("Marque pelo menos três pontos distintos para medir o telhado.");
                setArea(null);
                return;
              }
              setError("");
              setArea(measuredArea);
            };
            onMapEdited = (rawEvent) => {
              const event = rawEvent as Leaflet.DrawEvents.Edited;
              let totalArea = 0;
              let hasPolygon = false;
              event.layers.eachLayer((layer) => {
                if (!(layer instanceof L.Polygon)) return;
                const measuredArea = getPolygonArea(layer, L);
                if (measuredArea === null) return;
                totalArea += measuredArea;
                hasPolygon = true;
              });
              setArea(hasPolygon ? totalArea : null);
            };
            onMapDeleted = () => setArea(null);

            map.on(L.Draw.Event.CREATED, onMapCreated);
            map.on(L.Draw.Event.EDITED, onMapEdited);
            map.on(L.Draw.Event.DELETED, onMapDeleted);
          }).catch(() => {
            setError("Não foi possível iniciar as ferramentas de desenho.");
          });
        });
        imagery.on("tileerror", () => {
          if (!cancelled) setTilesUnavailable(true);
        });
        imagery.addTo(map);
        L.circleMarker([location.lat, location.lng], {
          radius: 7,
          color: "#ffffff",
          weight: 2,
          fillColor: "#dc2626",
          fillOpacity: 1,
        }).addTo(map);

        tileTimeout = window.setTimeout(() => {
          if (!hasLoadedTiles && !cancelled) setTilesUnavailable(true);
        }, 15000);
        window.requestAnimationFrame(() => map?.invalidateSize());
      })
      .catch((lookupError: unknown) => {
        if (cancelled) return;
        if (lookupError instanceof ResidentialAddressNotFoundError
          || lookupError instanceof ResidentialNumberRequiredError
          || lookupError instanceof NominatimRateLimitError
          || lookupError instanceof NominatimServiceError) {
          setError(lookupError.message);
        } else {
          setError("Não foi possível localizar esse endereço. Tente novamente mais tarde.");
        }
        setStatus("error");
      });

    return () => {
      cancelled = true;
      if (tileTimeout !== undefined) window.clearTimeout(tileTimeout);
      if (map && onMapCreated) map.off("draw:created", onMapCreated);
      if (map && onMapEdited) map.off("draw:edited", onMapEdited);
      if (map && onMapDeleted) map.off("draw:deleted", onMapDeleted);
      if (map && control) map.removeControl(control);
      map?.remove();
    };
  }, [address, residenceNumber]);

  return (
    <section className="mt-6 border-t border-slate-200 pt-5" aria-live="polite">
      {status === "loading" ? (
        <p className="mb-3 text-sm text-slate-600">Localizando a residência...</p>
      ) : null}
      {status === "error" ? (
        <p role="alert" className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      ) : null}
      {status !== "error" ? (
        <div className="relative">
          <div
            ref={mapElement}
            className="h-[420px] w-full overflow-hidden rounded-lg border border-slate-200 bg-slate-100"
            aria-label="Imagem aérea da residência"
          />
          {status === "ready" && !tilesLoaded && !tilesUnavailable ? (
            <p className="absolute left-3 top-3 z-[1000] rounded bg-white/95 px-3 py-2 text-sm text-slate-700 shadow">
              Carregando imagem aérea...
            </p>
          ) : null}
        </div>
      ) : null}
      {status === "ready" && coordinates ? (
        <>
          {tilesUnavailable ? (
            <p role="alert" className="mt-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              Não foi possível carregar a imagem aérea. A medição está desabilitada; tente novamente mais tarde.
            </p>
          ) : null}
          {error ? <p role="alert" className="mt-3 text-sm text-red-700">{error}</p> : null}
          <p className="mt-3 text-sm text-slate-600">
            Coordenadas: {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
          </p>
          <p className="mt-1 text-xs text-slate-500">Geocodificação: © OpenStreetMap contributors</p>
          {area !== null ? (
            <div role="status" className="mt-3">
              <p className="text-base font-semibold text-slate-900">
                Área projetada estimada: {area.toLocaleString("pt-BR", { maximumFractionDigits: 1 })} m²
              </p>
              <p className="mt-1 text-sm text-slate-600">
                Estimativa visual da projeção horizontal. Não inclui a inclinação do telhado e não substitui levantamento técnico.
              </p>
            </div>
          ) : null}
        </>
      ) : null}
    </section>
  );
}