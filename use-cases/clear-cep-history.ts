import type { CepRepository } from "../domain/repositories/cep-repository";

export class ClearCepHistoryUseCase {
  private readonly repository: CepRepository;

  constructor(repository: CepRepository) {
    this.repository = repository;
  }

  async execute(): Promise<void> {
    await this.repository.clearHistory();
  }
}