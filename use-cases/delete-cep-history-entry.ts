import type { CepRepository } from "../domain/repositories/cep-repository";

export class DeleteCepHistoryEntryUseCase {
  private readonly repository: CepRepository;

  constructor(repository: CepRepository) {
    this.repository = repository;
  }

  async execute(cep: string): Promise<void> {
    await this.repository.deleteHistoryEntry(cep);
  }
}