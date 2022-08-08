import { Injectable } from "@nestjs/common";
import { Channel, Video, VideoCompact } from "@youtube/entities";
import {
  Client as YoutubeiClient,
  LiveVideo,
  Video as YoutubeiVideo,
  VideoCompact as YoutubeiVideoCompact,
} from "youtubei";

@Injectable()
export class YoutubeiProvider {
  private readonly youtubeClient = new YoutubeiClient();

  public async searchVideo(keyword: string): Promise<VideoCompact[]> {
    const videos = await this.youtubeClient.search(keyword, { type: "video" });
    return videos.items.map(this.videoCompactToEntity);
  }

  public async getVideo(id: string): Promise<Video | undefined> {
    const video = await this.youtubeClient.getVideo(id);
    if (!video) return;

    return this.videoToEntity(video);
  }

  private videoToEntity(video: YoutubeiVideo | LiveVideo) {
    const channel = video.channel
      ? new Channel({
          id: video.channel.id,
          name: video.channel.name,
          thumbnails: video.channel.thumbnails || [],
        })
      : null;

    const entity = new Video({
      id: video.id,
      title: video.title,
      duration: "duration" in video ? video.duration || 0 : 0,
      thumbnails: video.thumbnails,
      viewCount: video.viewCount || null,
      channel,
      related: video.related.items
        .filter((r): r is YoutubeiVideoCompact => r instanceof YoutubeiVideoCompact)
        .map(this.videoCompactToEntity),
    });
    return entity;
  }

  private videoCompactToEntity(video: YoutubeiVideoCompact): VideoCompact {
    return new VideoCompact({
      id: video.id,
      title: video.title,
      duration: "duration" in video ? video.duration || 0 : 0,
      thumbnails: video.thumbnails,
      viewCount: video.viewCount || null,
      channel: video.channel
        ? new Channel({
            id: video.channel.id,
            name: video.channel.name,
            thumbnails: video.channel.thumbnails || [],
          })
        : null,
    });
  }
}