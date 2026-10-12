import type { Address, AddressInput } from "../address";

export interface AddressRepository {
  create(input: AddressInput): Promise<Address>;
  list(): Promise<Address[]>;
}
