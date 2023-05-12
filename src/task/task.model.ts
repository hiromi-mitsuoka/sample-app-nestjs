import { Field, ID, ObjectType, InputType } from "@nestjs/graphql";

@ObjectType()
export class Task {
    @Field(() => ID)
    id: number;
    name: string;
    description?: string
    createdAt: Date
    updatedAt: Date
}

@InputType()
export class TaskInput {
    @Field()
    name: string;
    description?: string;
}