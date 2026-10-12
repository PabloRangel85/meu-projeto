import type { Address, AddressInput } from "../domain/address";
import type { AddressRepository } from "../domain/repositories/address-repository";
import type { ViaCepClient } from "../infrastructure/http/via-cep-client";

export class CreateAddressUseCase {
  constructor(
    private readonly repository: AddressRepository,
    private readonly viaCepClient: ViaCepClient,
  ) {}

  async execute(cep: string): Promise<Address> {
    const normalizedCep = cep.replace(/\D/g, "").slice(0, 8);

    if (normalizedCep.length !== 8) {
      throw new Error("Informe um CEP válido com 8 dígitos.");
    }

    const viaCepData = await this.viaCepClient.getAddressByCep(normalizedCep);

    const addressInput: AddressInput = {
      cep: viaCepData.cep ?? normalizedCep,
      logradouro: viaCepData.logradouro ?? "",
      complemento: viaCepData.complemento ?? "",
      bairro: viaCepData.bairro ?? "",
      localidade: viaCepData.localidade ?? "",
      uf: viaCepData.uf ?? "",
      ibge: viaCepData.ibge ?? "",
      gia: viaCepData.gia ?? "",
      ddd: viaCepData.ddd ?? "",
      siafi: viaCepData.siafi ?? "",
    };

    return this.repository.create(addressInput);
  }
}
