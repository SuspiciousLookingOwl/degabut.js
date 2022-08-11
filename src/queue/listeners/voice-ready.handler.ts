import { VoiceReadyEvent } from "@discord-bot/events";
import { EventBus, EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { Member, Queue, VoiceChannel } from "@queue/entities";
import { QueueCreatedEvent } from "@queue/events";
import { QueueRepository } from "@queue/repositories";

@EventsHandler(VoiceReadyEvent)
export class VoiceReadyHandler implements IEventHandler<VoiceReadyEvent> {
  constructor(
    private readonly queueRepository: QueueRepository,
    private readonly eventBus: EventBus,
  ) {}

  public async handle({ player }: VoiceReadyEvent): Promise<void> {
    let queue = this.queueRepository.getByVoiceChannelId(player.voiceChannel.id);
    if (queue) return;

    queue = new Queue({
      guildId: player.guild.id,
      voiceChannel: new VoiceChannel({
        id: player.voiceChannel.id,
        name: player.voiceChannel.name,
        members: player.voiceChannel.members.map(
          (m) =>
            new Member({
              id: m.id,
              username: m.user.username,
              nickname: m.nickname,
              displayName: m.displayName,
              discriminator: m.user.discriminator,
              avatar: m.user.avatarURL(),
            }),
        ),
      }),
    });

    this.queueRepository.save(queue);

    this.eventBus.publish(new QueueCreatedEvent({ queue }));
  }
}
