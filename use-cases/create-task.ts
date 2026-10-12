import type { CreateTaskInput, Task } from "../domain/task";
import type { TaskRepository } from "../domain/repositories/task-repository";

export class CreateTaskUseCase {
  private readonly repository: TaskRepository;

  constructor(repository: TaskRepository) {
    this.repository = repository;
  }

  async execute(input: CreateTaskInput): Promise<Task> {
    const title = input.title.trim();

    if (!title) {
      throw new Error("The task title is required.");
    }

    return this.repository.create({ title });
  }
}
