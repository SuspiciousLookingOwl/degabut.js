import { ValidateParams } from "@common/decorators";
import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { CommandHandler, IInferredCommandHandler } from "@nestjs/cqrs";
import { QueueRepository } from "@queue/repositories";
import { QueueService } from "@queue/services";

import { ClearQueueCommand, ClearQueueParamSchema } from "./clear-queue.command";

@CommandHandler(ClearQueueCommand)
export class ClearQueueHandler implements IInferredCommandHandler<ClearQueueCommand> {
  constructor(
    private readonly queueRepository: QueueRepository,
    private readonly queueService: QueueService,
  ) {}

  @ValidateParams(ClearQueueParamSchema)
  public async execute(params: ClearQueueCommand): Promise<void> {
    const { voiceChannelId, removeNowPlaying, executor } = params;

    const queue = this.queueRepository.getByVoiceChannelId(voiceChannelId);
    if (!queue) throw new NotFoundException("Queue not found");
    if (!queue.hasMember(executor.id)) throw new ForbiddenException("Missing permissions");

    queue.tracks = queue.tracks.filter((t) => t.id === queue.nowPlaying?.id);
    if (removeNowPlaying) this.queueService.removeTrack(queue, true);
  }
}
