import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { TaskService } from './task.service';
import { Task, TaskInput } from './task.model';

@Resolver(() => Task)
export class TaskResolver {
    constructor(private taskService: TaskService){}

    @Query(() => [Task])
    async tasks(): Promise<Task[]> {
        return this.taskService.taskList();
    }

    @Mutation(() => Task)
    async createTask(@Args('data') data: TaskInput): Promise<Task> {
        return this.taskService.createTask(data);
    }

    @Mutation(() => Task)
    async updateTask(
        @Args('id') id: number,
        @Args('data') data: TaskInput,
    ): Promise<Task> {
        return this.taskService.updateTask(id, data);
    }

    @Mutation(() => Task)
    async deleteTask(@Args('id') id: number): Promise<Task> {
        return this.taskService.deleteTask(id);
    }
}