import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Task as PrismaTask } from '@prisma/client';
import { Task, TaskInput } from './task.model';

@Injectable()
export class TaskService {
    constructor(private prisma: PrismaService) {}

    async taskList(): Promise<Task[]> {
        const tasks = await this.prisma.task.findMany();
        return tasks.map((task: PrismaTask) => ({ 
            ...task,
            description: task.description ?? undefined,
        }));
    }

    async createTask(data: TaskInput): Promise<Task> {
        const createdTask = await this.prisma.task.create({ data })
        return { 
            ...createdTask, 
            description: createdTask.description ?? undefined
        }
    }

    async updateTask(id: number, data: TaskInput): Promise<Task> {
        const updatedTask = await this.prisma.task.update({
            where: { id },
            data: { ...data, },
        });
        return {
            ...updatedTask,
            description: updatedTask.description ?? undefined
        }
    }

    async deleteTask(id: number): Promise<Task> {
        const deletedTask = await this.prisma.task.delete({
            where: { id },
        })
        return {
            ...deletedTask,
            description: deletedTask.description ?? undefined
        }
    }
}