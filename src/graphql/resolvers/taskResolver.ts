import { Priority } from '@prisma/client';
import { GraphQLError } from 'graphql/error';
import { prisma } from '../../config/prisma';

export const taskResolver = {
  Query: {
    getTask: async (_: any, { id }: { id: string }) => {
      return prisma.task.findUnique({ where: { id } });
    },
    getAllTasks: async () => {
      return prisma.task.findMany();
    },
  },
  Mutation: {
    createTask: async (
      _: any,
      {
        title,
        description,
        priority,
      }: { title: string; description: string; priority: string }
    ) => {
      return prisma.task.create({
        data: { title, description, priority: priority.toUpperCase() as any },
      });
    },
    updateTask: async (
      _: any,
      {
        id,
        title,
        description,
        priority,
        done,
        archived,
      }: {
        id: string;
        title: string;
        description?: string;
        priority: Priority;
        done: boolean;
        archived: boolean;
      }
    ) => {
      return prisma.task.update({
        where: { id },
        data: { title, description, priority, done, archived },
      });
    },
    deleteTask: async (_: any, { id }: { id: string }) => {
      await prisma.task.delete({ where: { id } });
      return true;
    },
    toggleTaskDone: async (_: any, { id }: { id: string }) => {
      const task = await prisma.task.findUnique({ where: { id } });
      if (!task) throw new GraphQLError('Task not found');
      return prisma.task.update({
        where: { id },
        data: { done: !task.done },
      });
    },
    toggleTaskArchived: async (_: any, { id }: { id: string }) => {
      const task = await prisma.task.findUnique({ where: { id } });
      if (!task) throw new GraphQLError('Task not found');
      return prisma.task.update({
        where: { id },
        data: { archived: !task.archived },
      });
    },
  },
};
