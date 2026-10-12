import type { CepAddress } from "../domain/cep";
import type { CepRepository } from "../domain/repositories/cep-repository";

export class ListCepHistoryUseCase {
  private readonly repository: CepRepository;

  constructor(repository: CepRepository) {
    this.repository = repository;
  }

  async execute(): Promise<CepAddress[]> {
    return this.repository.listHistory();
  }
}
