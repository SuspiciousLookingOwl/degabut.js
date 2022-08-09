import { DiscordUtil } from "@common/utils";
import { Injectable } from "@nestjs/common";
import { QueryBus } from "@nestjs/cqrs";
import { GetQueueQuery } from "@queue/queries";
import { YoutubeiProvider } from "@youtube/providers";
import {
  ActionRowBuilder,
  EmbedBuilder,
  Message,
  MessageActionRowComponentBuilder,
} from "discord.js";

import { PrefixCommand } from "../decorators";
import { IPrefixCommand } from "../interfaces";

@Injectable()
@PrefixCommand({
  name: "related",
})
export class RelatedPrefixCommand implements IPrefixCommand {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly youtubeiProvider: YoutubeiProvider,
  ) {}

  public async handler(message: Message): Promise<void> {
    if (!message.member?.voice.channelId) return;

    const query = new GetQueueQuery({
      voiceChannelId: message.member.voice.channelId,
      executor: { id: message.author.id },
    });
    const queue = await this.queryBus.execute(query);

    if (!queue?.nowPlaying) return;

    const video = await this.youtubeiProvider.getVideo(queue.nowPlaying.id);
    if (!video) return;

    const buttons = video.related.map((v, i) => DiscordUtil.videoToMessageButton(v, i));

    await message.reply({
      content: `⭐ **Songs related with ${queue.nowPlaying.video.title}**`,
      embeds: [
        new EmbedBuilder({
          fields: video.related.map(DiscordUtil.videoToEmbedField),
        }),
      ],
      components: [
        new ActionRowBuilder<MessageActionRowComponentBuilder>({
          components: buttons.slice(0, 5),
        }),
        new ActionRowBuilder<MessageActionRowComponentBuilder>({
          components: buttons.slice(5, 10),
        }),
      ],
    });
  }
}
