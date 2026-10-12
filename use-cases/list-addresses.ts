import type { Address } from "../domain/address";
import type { AddressRepository } from "../domain/repositories/address-repository";

export class ListAddressesUseCase {
  constructor(private readonly repository: AddressRepository) {}

  async execute(): Promise<Address[]> {
    return this.repository.list();
  }
}
