import mongoose from "mongoose";
const { Schema, model } = mongoose;

interface IBaseTaskSchema {
  id: number;
  description: string;
}

export interface ITaskSchema extends IBaseTaskSchema {
  duration: number;
  expiresAt: Date;
}

export interface IBotSchema {
  name: string;
  tasks: ITaskSchema[];
}

interface IBotTasksSchemas extends IBaseTaskSchema {
  endsAt: Date;
}

const tasksSchema = new Schema<ITaskSchema>({
  id: Number,
  description: String,
  duration: Number,
  expiresAt: {
    type: Date,
    default: null,
    index: { expireAfterSeconds: 0 },
  },
});

const botSchema = new Schema<IBotSchema>({
  name: { type: String, required: true, unique: true },
  tasks: {
    type: [
      new Schema<IBotTasksSchemas>({
        id: Number,
        description: String,
        endsAt: { type: Date, default: null },
      }),
    ],
    default: [],
    validate: {
      validator: function (value) {
        return value.length <= 2; // Maximum 2 items
      },
      message: "A maximum of 2 tasks can be assigned to a Bot.",
    },
  },
});

const Task = model<ITaskSchema>("tasks", tasksSchema);
const Bot = model<IBotSchema>("bots", botSchema);

export { Task, Bot };
