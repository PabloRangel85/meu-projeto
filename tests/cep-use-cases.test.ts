import { describe, expect, it } from "vitest";

import { SearchCepUseCase } from "../use-cases/search-cep";
import { ListCepHistoryUseCase } from "../use-cases/list-cep-history";
import { ClearCepHistoryUseCase } from "../use-cases/clear-cep-history";
import { DeleteCepHistoryEntryUseCase } from "../use-cases/delete-cep-history-entry";
import type { CepAddress } from "../domain/cep";
import type { CepRepository } from "../domain/repositories/cep-repository";

class InMemoryCepRepository implements CepRepository {
  private records: CepAddress[] = [];

  async findByCep(cep: string): Promise<CepAddress> {
    const found = this.records.find((item) => item.cep === cep);

    if (found) {
      return found;
    }

    const result: CepAddress = {
      cep,
      logradouro: "Praça da Sé",
      complemento: "lado ímpar",
      bairro: "Sé",
      localidade: "São Paulo",
      uf: "SP",
      ibge: "3550308",
      gia: "1004",
      ddd: "11",
      siafi: "7107",
      searchedAt: new Date("2024-01-01T00:00:00.000Z"),
    };

    this.records.push(result);
    return result;
  }

  async listHistory(): Promise<CepAddress[]> {
    return [...this.records];
  }

  async clearHistory(): Promise<void> {
    this.records = [];
  }

  async deleteHistoryEntry(cep: string): Promise<void> {
    this.records = this.records.filter((item) => item.cep !== cep);
  }
}

describe("CEP use cases", () => {
  it("search cep use case returns a normalized CEP record", async () => {
    const repository = new InMemoryCepRepository();
    const useCase = new SearchCepUseCase(repository);

    const result = await useCase.execute("01001000");

    expect(result.cep).toBe("01001000");
    expect(result.localidade).toBe("São Paulo");
    expect(result.uf).toBe("SP");
  });

  it("list history use case returns saved records", async () => {
    const repository = new InMemoryCepRepository();
    const useCase = new ListCepHistoryUseCase(repository);

    await repository.findByCep("01001000");

    const history = await useCase.execute();

    expect(history).toHaveLength(1);
    expect(history[0].cep).toBe("01001000");
  });

  it("clear history use case removes saved records", async () => {
    const repository = new InMemoryCepRepository();
    const useCase = new ClearCepHistoryUseCase(repository);

    await repository.findByCep("01001000");
    await useCase.execute();

    expect(await repository.listHistory()).toEqual([]);
  });

  it("delete history entry use case preserves other records", async () => {
    const repository = new InMemoryCepRepository();
    const useCase = new DeleteCepHistoryEntryUseCase(repository);

    await repository.findByCep("01001000");
    await repository.findByCep("20040002");
    await useCase.execute("01001000");

    const history = await repository.listHistory();
    expect(history).toHaveLength(1);
    expect(history[0].cep).toBe("20040002");
  });
});
