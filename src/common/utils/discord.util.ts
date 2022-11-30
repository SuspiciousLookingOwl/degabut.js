import { TrackDto } from "@queue/dtos";
import { Track } from "@queue/entities";
import { Video, VideoCompact } from "@youtube/entities";
import { ButtonBuilder, ButtonStyle, EmbedBuilder, EmbedField } from "discord.js";

import { TimeUtil } from "./time.util";

const numbers = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟"];

export class DiscordUtil {
  static videoToMessageButton(
    video: Omit<Video | VideoCompact, "updatedAt">,
    index: number,
  ): ButtonBuilder {
    return new ButtonBuilder({
      customId: `play/${video.id}`,
      label: video.title.length < 20 ? video.title : video.title.substring(0, 20) + "...",
      style: ButtonStyle.Success,
      emoji: numbers[index],
    });
  }

  static videoToEmbedField(
    video: Omit<Video | VideoCompact, "updatedAt">,
    index: number,
  ): EmbedField {
    return {
      name: `${numbers[index]} ${video.title}`,
      value: [
        `**${video.channel?.name}**`,
        `https://youtu.be/${video.id}`,
        `Duration: ${video.duration ? TimeUtil.secondToTime(video.duration) : "-"}`,
      ].join("\n"),
      inline: false,
    };
  }

  static trackToEmbed(track: Track | TrackDto): EmbedBuilder {
    const fields = [
      {
        name: "Duration",
        value: TimeUtil.secondToTime(track.video.duration),
      },
    ];
    const descriptions: string[] = [];
    if (track.video.channel) descriptions.push(`**${track.video.channel.name}**`);
    if (track.requestedBy) descriptions.push(`Requested by <@!${track.requestedBy.id}>`);

    const thumbnail = track.video.thumbnails.at(-1);

    return new EmbedBuilder({
      title: track.video.title,
      description: descriptions.join("\r\n"),
      url: track.url,
      image: thumbnail ? { url: thumbnail.url } : undefined,
      fields,
    });
  }
}
