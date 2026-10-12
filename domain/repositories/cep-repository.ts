import type { CepAddress } from "../cep";

export interface CepRepository {
  findByCep(cep: string): Promise<CepAddress>;
  listHistory(): Promise<CepAddress[]>;
  deleteHistoryEntry(cep: string): Promise<void>;
  clearHistory(): Promise<void>;
}
