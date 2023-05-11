import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Task } from 'src/task/task.model';
import { PrismaService } from 'src/prisma/prisma.service';

@Resolver(() => Task)
export class TaskResolver {
    constructor(private prisma: PrismaService) {}

    @Query(() => [Task])
    async tasks() {
        return this.prisma.task.findMany();
    }

    @Mutation(() => Task)
    async createTask(
        @Args('name') name: string,
        @Args('description') description: string,
    ) {
        return this.prisma.task.create({
            data: { name, description }
        });
    }
}