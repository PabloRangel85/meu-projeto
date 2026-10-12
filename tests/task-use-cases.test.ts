import { describe, expect, it, vi } from "vitest";

import { CreateTaskUseCase } from "../use-cases/create-task";
import { ListTasksUseCase } from "../use-cases/list-tasks";
import type { Task } from "../domain/task";
import type { TaskRepository } from "../domain/repositories/task-repository";

class InMemoryTaskRepository implements TaskRepository {
  private tasks: Task[] = [
    {
      id: "1",
      title: "First task",
      done: false,
      createdAt: new Date("2024-01-01T00:00:00.000Z"),
    },
  ];

  async list(): Promise<Task[]> {
    return [...this.tasks];
  }

  async create(input: { title: string }): Promise<Task> {
    const task: Task = {
      id: crypto.randomUUID(),
      title: input.title,
      done: false,
      createdAt: new Date(),
    };

    this.tasks.push(task);
    return task;
  }
}

describe("Task use cases", () => {
  it("list tasks use case returns persisted tasks", async () => {
    const repository = new InMemoryTaskRepository();
    const useCase = new ListTasksUseCase(repository);

    const tasks = await useCase.execute();

    expect(tasks).toHaveLength(1);
    expect(tasks[0].title).toBe("First task");
  });

  it("create task use case stores a new task", async () => {
    const repository = new InMemoryTaskRepository();
    const useCase = new CreateTaskUseCase(repository);

    const task = await useCase.execute({ title: "Second task" });

    expect(task.title).toBe("Second task");
    expect(task.done).toBe(false);
    expect(task.id.length).toBeGreaterThan(0);
  });
});
