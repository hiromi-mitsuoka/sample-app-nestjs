import { Module } from "@nestjs/common";
import { TaskResolver } from "./task.resolver";
import { TaskService } from "./task.service";
import { PrismaService } from "src/prisma/prisma.service";

@Module({
    providers: [TaskResolver, TaskService, PrismaService]
})
export class TaskModule {}