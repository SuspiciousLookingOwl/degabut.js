import { ValidateParams } from "@common/decorators";
import { BadRequestException, ForbiddenException, NotFoundException } from "@nestjs/common";
import { CommandHandler, IInferredCommandHandler } from "@nestjs/cqrs";
import { QueueRepository } from "@queue/repositories";
import { QueueService } from "@queue/services";

import { PlayTrackCommand, PlayTrackParamSchema } from "./play-track.command";

@CommandHandler(PlayTrackCommand)
export class PlayTrackHandler implements IInferredCommandHandler<PlayTrackCommand> {
  constructor(
    private readonly queueRepository: QueueRepository,
    private readonly queueService: QueueService,
  ) {}

  @ValidateParams(PlayTrackParamSchema)
  public async execute(params: PlayTrackCommand): Promise<string> {
    const { voiceChannelId, index, trackId, executor } = params;

    const queue = this.queueRepository.getByVoiceChannelId(voiceChannelId);
    if (!queue) throw new NotFoundException("Queue not found");
    if (!queue.hasMember(executor.id)) throw new ForbiddenException("Missing permissions");

    const track = index ? queue.tracks[index] : queue.tracks.find((t) => t.id === trackId);
    if (!track) throw new NotFoundException("Track not found");
    if (track.id === queue.nowPlaying?.id)
      throw new BadRequestException("Track is currently playing");

    queue.nextTrack = track;
    this.queueService.processQueue(queue);

    return track.id;
  }
}
