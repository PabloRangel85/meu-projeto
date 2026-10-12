import type { CepAddress } from "../domain/cep";
import type { CepRepository } from "../domain/repositories/cep-repository";

export class SearchCepUseCase {
  private readonly repository: CepRepository;

  constructor(repository: CepRepository) {
    this.repository = repository;
  }

  async execute(cep: string): Promise<CepAddress> {
    const normalizedCep = cep.replace(/\D/g, "");

    if (normalizedCep.length !== 8) {
      throw new Error("Informe um CEP válido com 8 dígitos.");
    }

    return this.repository.findByCep(normalizedCep);
  }
}
