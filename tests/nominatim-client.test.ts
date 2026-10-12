import { describe, expect, it, vi } from "vitest";

import {
  formatResidentialAddress,
  geocodeResidentialAddress,
  NominatimRateLimitError,
  NominatimServiceError,
  ResidentialAddressNotFoundError,
  ResidentialNumberRequiredError,
  type ResidentialAddress,
} from "../infrastructure/maps/nominatim-client";

const address: ResidentialAddress = {
  logradouro: "Rua das Flores",
  complemento: "casa 2",
  bairro: "Centro",
  localidade: "Curitiba",
  uf: "PR",
  cep: "80000-000",
};

function createResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("Nominatim client", () => {
  it("formats the complete residential address", () => {
    expect(formatResidentialAddress(address, "42A")).toBe(
      "Rua das Flores, 42A, casa 2, Centro, Curitiba, PR, 80000-000, Brasil",
    );
    expect(formatResidentialAddress(address, "S/N")).toContain("S/N");
  });

  it("requires a residence number or identifier", () => {
    expect(() => formatResidentialAddress(address, " ")).toThrow(ResidentialNumberRequiredError);
  });

  it("requests one Nominatim result for the complete address", async () => {
    const request = vi.fn<typeof fetch>().mockResolvedValue(createResponse([
      { lat: "-25.43", lon: "-49.27" },
    ]));

    await expect(geocodeResidentialAddress(address, "42", request)).resolves.toEqual({
      lat: -25.43,
      lng: -49.27,
    });

    const [url, options] = request.mock.calls[0];
    const searchUrl = new URL(String(url));
    expect(searchUrl.origin).toBe("https://nominatim.openstreetmap.org");
    expect(searchUrl.pathname).toBe("/search");
    expect(searchUrl.searchParams.get("format")).toBe("jsonv2");
    expect(searchUrl.searchParams.get("limit")).toBe("1");
    expect(searchUrl.searchParams.get("street")).toBe("42 Rua das Flores");
    expect(searchUrl.searchParams.get("city")).toBe("Curitiba");
    expect(searchUrl.searchParams.get("state")).toBe("PR");
    expect(searchUrl.searchParams.get("postalcode")).toBe("80000-000");
    expect(searchUrl.searchParams.get("country")).toBe("Brazil");
    expect(options?.referrerPolicy).toBe("strict-origin-when-cross-origin");
  });

  it("caches successful coordinates for repeated address lookups", async () => {
    const request = vi.fn<typeof fetch>().mockResolvedValue(createResponse([
      { lat: "-23.55", lon: "-46.63" },
    ]));

    await geocodeResidentialAddress(address, "cache-check-91", request);
    await geocodeResidentialAddress(address, "cache-check-91", request);

    expect(request).toHaveBeenCalledTimes(1);
  });

  it("distinguishes an address with no result", async () => {
    const request = vi.fn<typeof fetch>().mockResolvedValue(createResponse([]));

    await expect(geocodeResidentialAddress(address, "no-result-check-72", request)).rejects.toThrow(
      ResidentialAddressNotFoundError,
    );
  });

  it("reports Nominatim rate limits separately", async () => {
    const request = vi.fn<typeof fetch>().mockResolvedValue(createResponse({}, 429));

    await expect(geocodeResidentialAddress(address, "rate-check-83", request)).rejects.toThrow(
      NominatimRateLimitError,
    );
  });

  it("reports provider and invalid coordinate responses", async () => {
    const failedRequest = vi.fn<typeof fetch>().mockResolvedValue(createResponse({}, 503));
    await expect(geocodeResidentialAddress(address, "service-check-64", failedRequest)).rejects.toThrow(
      NominatimServiceError,
    );

    const invalidCoordinates = vi.fn<typeof fetch>().mockResolvedValue(createResponse([
      { lat: "91", lon: "-49.27" },
    ]));
    await expect(geocodeResidentialAddress(address, "invalid-check-55", invalidCoordinates)).rejects.toThrow(
      NominatimServiceError,
    );
  });
});