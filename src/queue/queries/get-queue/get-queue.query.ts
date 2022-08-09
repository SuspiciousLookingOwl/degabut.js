import { Query } from "@common/cqrs";
import { Executor, IWithExecutor } from "@common/interfaces";
import { ExecutorSchema } from "@common/schemas";
import { QueueDto } from "@queue/dtos";
import * as Joi from "joi";

export type GetQueueResult = QueueDto | null;

export class GetQueueQuery extends Query<GetQueueResult> implements IWithExecutor {
  readonly voiceChannelId!: string;
  readonly executor!: Executor;

  constructor(params: GetQueueQuery) {
    super();
    Object.assign(this, params);
  }
}

export const GetQueueParamSchema = Joi.object<GetQueueQuery>({
  voiceChannelId: Joi.string().required(),
  executor: ExecutorSchema,
}).required();
