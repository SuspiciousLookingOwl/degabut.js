import { QueuePlayerRepository } from "@discord-bot/repositories";
import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { TrackRemovedEvent } from "@queue/events";
import { EmbedBuilder } from "discord.js";

@EventsHandler(TrackRemovedEvent)
export class TrackRemovedHandler implements IEventHandler<TrackRemovedEvent> {
  constructor(private readonly playerRepository: QueuePlayerRepository) {}

  public async handle({ track, member, isNowPlaying }: TrackRemovedEvent): Promise<void> {
    if (!member) return; // removed from queue being processed

    const player = this.playerRepository.getByVoiceChannelId(track.queue.voiceChannelId);
    if (!player) return;

    const embed = new EmbedBuilder({
      description: `🚮 **<@!${member.id}> removed ${track.video.title} from queue**`,
    });

    if (isNowPlaying) player.audioPlayer.stop();

    await player.notify({
      embeds: [embed],
    });
  }
}
