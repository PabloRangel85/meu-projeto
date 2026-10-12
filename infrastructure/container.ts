import { CreateAddressUseCase } from "../use-cases/create-address";
import { CreateTaskUseCase } from "../use-cases/create-task";
import { ListAddressesUseCase } from "../use-cases/list-addresses";
import { ListTasksUseCase } from "../use-cases/list-tasks";
import { ListCepHistoryUseCase } from "../use-cases/list-cep-history";
import { ClearCepHistoryUseCase } from "../use-cases/clear-cep-history";
import { DeleteCepHistoryEntryUseCase } from "../use-cases/delete-cep-history-entry";
import { SearchCepUseCase } from "../use-cases/search-cep";
import { ViaCepHttpClient } from "./http/via-cep-client";
import { SqliteAddressRepository } from "./repositories/address-repository";
import { SqliteCepRepository } from "./repositories/cep-repository";
import { SqliteTaskRepository } from "./repositories/task-repository";

const cepRepository = new SqliteCepRepository();
const taskRepository = new SqliteTaskRepository();
const addressRepository = new SqliteAddressRepository();
const viaCepClient = new ViaCepHttpClient();

export const searchCepUseCase = new SearchCepUseCase(cepRepository);
export const listCepHistoryUseCase = new ListCepHistoryUseCase(cepRepository);
export const clearCepHistoryUseCase = new ClearCepHistoryUseCase(cepRepository);
export const deleteCepHistoryEntryUseCase = new DeleteCepHistoryEntryUseCase(cepRepository);
export const createTaskUseCase = new CreateTaskUseCase(taskRepository);
export const listTasksUseCase = new ListTasksUseCase(taskRepository);
export const createAddressUseCase = new CreateAddressUseCase(addressRepository, viaCepClient);
export const listAddressesUseCase = new ListAddressesUseCase(addressRepository);
