import type { Task } from "../domain/task";
import type { TaskRepository } from "../domain/repositories/task-repository";

export class ListTasksUseCase {
  private readonly repository: TaskRepository;

  constructor(repository: TaskRepository) {
    this.repository = repository;
  }

  async execute(): Promise<Task[]> {
    return this.repository.list();
  }
}
