import { Field, ID, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class Task {
    @Field(() => ID)
    id: number;
    name: string;
    description?: string
    createdAt: Date
    updatedAt: Date
}