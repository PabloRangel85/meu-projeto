import { eq } from "drizzle-orm";

import type { CreateTaskInput, Task } from "../../domain/task";
import type { TaskRepository } from "../../domain/repositories/task-repository";
import { db } from "../db/client";
import { tasks } from "../db/schema";

const toTask = (row: typeof tasks.$inferSelect): Task => ({
  id: row.id,
  title: row.title,
  done: Boolean(row.done),
  createdAt: new Date(row.createdAt),
});

export class SqliteTaskRepository implements TaskRepository {
  async list(): Promise<Task[]> {
    const rows = await db.select().from(tasks).all();
    return rows.map(toTask);
  }

  async create(input: CreateTaskInput): Promise<Task> {
    const id = crypto.randomUUID();
    const createdAt = new Date();

    await db.insert(tasks).values({
      id,
      title: input.title,
      done: false,
      createdAt,
    });

    const [created] = await db.select().from(tasks).where(eq(tasks.id, id)).all();

    if (!created) {
      throw new Error("Unable to create task.");
    }

    return toTask(created);
  }
}
