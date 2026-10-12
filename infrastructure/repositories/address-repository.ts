import { desc, eq } from "drizzle-orm";

import type { Address, AddressInput } from "../../domain/address";
import type { AddressRepository as AddressRepositoryContract } from "../../domain/repositories/address-repository";
import { db } from "../db/client";
import { addresses } from "../db/schema";

const toAddress = (row: typeof addresses.$inferSelect): Address => ({
  id: row.id,
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
  createdAt: new Date(row.createdAt),
});

export class SqliteAddressRepository implements AddressRepositoryContract {
  async create(input: AddressInput): Promise<Address> {
    const id = crypto.randomUUID();
    const createdAt = new Date();

    await db.insert(addresses).values({
      id,
      cep: input.cep,
      logradouro: input.logradouro,
      complemento: input.complemento ?? "",
      bairro: input.bairro,
      localidade: input.localidade,
      uf: input.uf,
      ibge: input.ibge ?? "",
      gia: input.gia ?? "",
      ddd: input.ddd ?? "",
      siafi: input.siafi ?? "",
      createdAt,
    });

    const [created] = await db.select().from(addresses).where(eq(addresses.id, id)).all();

    if (!created) {
      throw new Error("Unable to create address.");
    }

    return toAddress(created);
  }

  async list(): Promise<Address[]> {
    const rows = await db.select().from(addresses).orderBy(desc(addresses.createdAt)).all();
    return rows.map(toAddress);
  }
}
