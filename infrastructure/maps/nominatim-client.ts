export type ResidentialAddress = {
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  cep: string;
};

export type Coordinates = {
  lat: number;
  lng: number;
};

export class ResidentialNumberRequiredError extends Error {
  constructor() {
    super("Informe o número da residência ou S/N para localizar o imóvel.");
    this.name = "ResidentialNumberRequiredError";
  }
}

export class ResidentialAddressNotFoundError extends Error {
  constructor() {
    super("Não foi possível localizar esse endereço. Confira os dados e tente novamente.");
    this.name = "ResidentialAddressNotFoundError";
  }
}

export class NominatimRateLimitError extends Error {
  constructor() {
    super("O serviço de localização está limitando as consultas. Aguarde um pouco e tente novamente.");
    this.name = "NominatimRateLimitError";
  }
}

export class NominatimServiceError extends Error {
  constructor() {
    super("Não foi possível consultar o serviço de localização. Tente novamente mais tarde.");
    this.name = "NominatimServiceError";
  }
}

type NominatimResult = {
  lat: string;
  lon: string;
};

type GeocodeRequest = typeof fetch;

const coordinateCache = new Map<string, Promise<Coordinates>>();

export function formatResidentialAddress(
  address: ResidentialAddress,
  residenceNumber: string,
): string {
  const normalizedNumber = residenceNumber.trim();
  if (!normalizedNumber) {
    throw new ResidentialNumberRequiredError();
  }

  return [
    address.logradouro,
    normalizedNumber,
    address.complemento,
    address.bairro,
    address.localidade,
    address.uf,
    address.cep,
    "Brasil",
  ]
    .filter(Boolean)
    .join(", ");
}

function formatPostalCode(cep: string): string {
  const digits = cep.replace(/\D/g, "");
  return digits.length === 8 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : cep;
}

export async function geocodeResidentialAddress(
  address: ResidentialAddress,
  residenceNumber: string,
  request: GeocodeRequest = fetch,
): Promise<Coordinates> {
  const query = formatResidentialAddress(address, residenceNumber);
  const cacheKey = query.trim().toLocaleLowerCase("pt-BR");
  const cached = coordinateCache.get(cacheKey);
  if (cached) return cached;

  const searchUrl = new URL("https://nominatim.openstreetmap.org/search");
  searchUrl.searchParams.set("format", "jsonv2");
  searchUrl.searchParams.set("limit", "1");
  searchUrl.searchParams.set("street", [residenceNumber.trim(), address.logradouro].filter(Boolean).join(" "));
  searchUrl.searchParams.set("city", address.localidade);
  searchUrl.searchParams.set("state", address.uf);
  searchUrl.searchParams.set("postalcode", formatPostalCode(address.cep));
  searchUrl.searchParams.set("country", "Brazil");

  const lookup = request(searchUrl, {
    method: "GET",
    headers: { Accept: "application/json" },
    cache: "no-store",
    referrerPolicy: "strict-origin-when-cross-origin",
  })
    .then(async (response) => {
      if (response.status === 429) throw new NominatimRateLimitError();
      if (!response.ok) throw new NominatimServiceError();

      const results = (await response.json()) as NominatimResult[];
      const firstResult = results[0];
      if (!firstResult) throw new ResidentialAddressNotFoundError();

      const lat = Number(firstResult.lat);
      const lng = Number(firstResult.lon);
      if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
        throw new NominatimServiceError();
      }

      return { lat, lng };
    })
    .catch((error: unknown) => {
      if (error instanceof NominatimRateLimitError
        || error instanceof NominatimServiceError
        || error instanceof ResidentialAddressNotFoundError) {
        throw error;
      }
      throw new NominatimServiceError();
    });

  coordinateCache.set(cacheKey, lookup);
  try {
    return await lookup;
  } catch (error) {
    coordinateCache.delete(cacheKey);
    throw error;
  }
}