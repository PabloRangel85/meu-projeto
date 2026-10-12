export type Task = {
  id: string;
  title: string;
  done: boolean;
  createdAt: Date;
};

export type CreateTaskInput = {
  title: string;
};
