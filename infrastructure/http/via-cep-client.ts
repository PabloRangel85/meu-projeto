import type { ViaCepAddressResponse } from "../../domain/address";

export interface ViaCepClient {
  getAddressByCep(cep: string): Promise<ViaCepAddressResponse>;
}

export class ViaCepHttpClient implements ViaCepClient {
  async getAddressByCep(cep: string): Promise<ViaCepAddressResponse> {
    const normalizedCep = cep.replace(/\D/g, "").slice(0, 8);

    if (normalizedCep.length !== 8) {
      throw new Error("Informe um CEP válido com 8 dígitos.");
    }

    const response = await fetch(`https://viacep.com.br/ws/${normalizedCep}/json/`, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Não foi possível consultar o CEP no ViaCEP.");
    }

    const data = (await response.json()) as ViaCepAddressResponse;

    if (data.erro) {
      throw new Error("CEP não encontrado.");
    }

    return {
      cep: data.cep ?? normalizedCep,
      logradouro: data.logradouro ?? "",
      complemento: data.complemento ?? "",
      bairro: data.bairro ?? "",
      localidade: data.localidade ?? "",
      uf: data.uf ?? "",
      ibge: data.ibge ?? "",
      gia: data.gia ?? "",
      ddd: data.ddd ?? "",
      siafi: data.siafi ?? "",
    };
  }
}
