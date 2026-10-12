"use server";

import { revalidatePath } from "next/cache";

import { createTaskUseCase } from "../infrastructure/container";

export async function createTask(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();

  if (!title) {
    return;
  }

  await createTaskUseCase.execute({ title });
  revalidatePath("/");
}
