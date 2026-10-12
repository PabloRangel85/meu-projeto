import { describe, expect, it, vi } from "vitest";

import type { Address, ViaCepAddressResponse } from "../domain/address";
import type { AddressRepository } from "../domain/repositories/address-repository";
import type { ViaCepClient } from "../infrastructure/http/via-cep-client";
import { CreateAddressUseCase } from "../use-cases/create-address";

const createdAddress: Address = {
  id: "address-1",
  cep: "01001000",
  logradouro: "Praça da Sé",
  complemento: "lado ímpar",
  bairro: "Sé",
  localidade: "São Paulo",
  uf: "SP",
  ibge: "3550308",
  gia: "1004",
  ddd: "11",
  siafi: "7107",
  createdAt: new Date("2024-01-01T00:00:00.000Z"),
};

describe("CreateAddressUseCase", () => {
  it("fetches the address from ViaCEP and persists it", async () => {
    const viaCepClient: ViaCepClient = {
      getAddressByCep: vi.fn().mockResolvedValue({
        cep: "01001000",
        logradouro: "Praça da Sé",
        complemento: "lado ímpar",
        bairro: "Sé",
        localidade: "São Paulo",
        uf: "SP",
        ibge: "3550308",
        gia: "1004",
        ddd: "11",
        siafi: "7107",
      } satisfies ViaCepAddressResponse),
    };

    const repository: AddressRepository = {
      create: vi.fn().mockResolvedValue(createdAddress),
      list: vi.fn(),
    };

    const useCase = new CreateAddressUseCase(repository, viaCepClient);

    const result = await useCase.execute("01001-000");

    expect(viaCepClient.getAddressByCep).toHaveBeenCalledWith("01001000");
    expect(repository.create).toHaveBeenCalledWith({
      cep: "01001000",
      logradouro: "Praça da Sé",
      complemento: "lado ímpar",
      bairro: "Sé",
      localidade: "São Paulo",
      uf: "SP",
      ibge: "3550308",
      gia: "1004",
      ddd: "11",
      siafi: "7107",
    });
    expect(result).toEqual(createdAddress);
  });

  it("rejects invalid CEP values before making the external request", async () => {
    const viaCepClient: ViaCepClient = {
      getAddressByCep: vi.fn(),
    };

    const repository: AddressRepository = {
      create: vi.fn(),
      list: vi.fn(),
    };

    const useCase = new CreateAddressUseCase(repository, viaCepClient);

    await expect(useCase.execute("123")).rejects.toThrow("Informe um CEP válido com 8 dígitos.");
    expect(viaCepClient.getAddressByCep).not.toHaveBeenCalled();
    expect(repository.create).not.toHaveBeenCalled();
  });
});
