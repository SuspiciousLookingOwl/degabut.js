import { EventHandler } from "@core";
import { Queue } from "@modules/queue/entities/Queue";
import { Track } from "@modules/queue/entities/Track";
import { injectable } from "tsyringe";

type Data = {
	track: Track;
	queue: Queue;
	isPlayedImmediately: boolean;
};

@injectable()
export class OnTrackAddEvent extends EventHandler<Data> {
	public async run({ queue, track, isPlayedImmediately }: Data): Promise<void> {
		if (isPlayedImmediately) return;

		await queue.textChannel.send({
			content: `🎵 **Added To Queue** (${queue.tracks.length})`,
			embeds: [track.embed],
		});
	}
}
