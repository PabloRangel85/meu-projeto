import { desc, eq } from "drizzle-orm";

import type { CepAddress, ViaCepResponse } from "../../domain/cep";
import type { CepRepository } from "../../domain/repositories/cep-repository";
import { db } from "../db/client";
import { cepHistory } from "../db/schema";

const normalizeCep = (cep: string) => cep.replace(/\D/g, "").slice(0, 8);

const toCepAddress = (row: typeof cepHistory.$inferSelect): CepAddress => ({
  cep: row.cep,
  logradouro: row.logradouro,
  complemento: row.complemento ?? "",
  bairro: row.bairro,
  localidade: row.localidade,
  uf: row.uf,
  ibge: row.ibge ?? "",
  gia: row.gia ?? "",
  ddd: row.ddd ?? "",
  siafi: row.siafi ?? "",
  searchedAt: new Date(row.searchedAt),
});

export class SqliteCepRepository implements CepRepository {
  async findByCep(cep: string): Promise<CepAddress> {
    const normalizedCep = normalizeCep(cep);

    if (normalizedCep.length !== 8) {
      throw new Error("Informe um CEP válido com 8 dígitos.");
    }

    const existingRows = await db
      .select()
      .from(cepHistory)
      .where(eq(cepHistory.cep, normalizedCep))
      .orderBy(desc(cepHistory.searchedAt))
      .limit(1)
      .all();

    if (existingRows.length > 0) {
      return toCepAddress(existingRows[0]);
    }

    const response = await fetch(`https://viacep.com.br/ws/${normalizedCep}/json/`, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Não foi possível consultar o CEP no ViaCEP.");
    }

    const data = (await response.json()) as ViaCepResponse;

    if (data.erro) {
      throw new Error("CEP não encontrado.");
    }

    const record: CepAddress = {
      cep: normalizedCep,
      logradouro: data.logradouro ?? "",
      complemento: data.complemento ?? "",
      bairro: data.bairro ?? "",
      localidade: data.localidade ?? "",
      uf: data.uf ?? "",
      ibge: data.ibge ?? "",
      gia: data.gia ?? "",
      ddd: data.ddd ?? "",
      siafi: data.siafi ?? "",
      searchedAt: new Date(),
    };

    await db.insert(cepHistory).values({
      id: crypto.randomUUID(),
      cep: record.cep,
      logradouro: record.logradouro,
      complemento: record.complemento,
      bairro: record.bairro,
      localidade: record.localidade,
      uf: record.uf,
      ibge: record.ibge,
      gia: record.gia,
      ddd: record.ddd,
      siafi: record.siafi,
      searchedAt: record.searchedAt,
    });

    return record;
  }

  async listHistory(): Promise<CepAddress[]> {
    const rows = await db.select().from(cepHistory).orderBy(desc(cepHistory.searchedAt)).all();
    return rows.map(toCepAddress);
  }

  async deleteHistoryEntry(cep: string): Promise<void> {
    await db.delete(cepHistory).where(eq(cepHistory.cep, normalizeCep(cep)));
  }

  async clearHistory(): Promise<void> {
    await db.delete(cepHistory);
  }
}
