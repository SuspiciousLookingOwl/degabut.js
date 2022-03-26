import { AddTrackUseCase } from "@modules/queue";
import { TextChannel } from "discord.js";
import { delay, inject, injectable } from "tsyringe";
import { CommandExecuteProps, ICommand } from "../core";

@injectable()
export class PlayCommand implements ICommand {
	public readonly name = "play";
	public readonly description = "Play a song";
	public readonly aliases = ["p"];

	constructor(@inject(delay(() => AddTrackUseCase)) private addTrack: AddTrackUseCase) {}

	public async execute({ message, args }: CommandExecuteProps): Promise<void> {
		const keyword = args.join(" ");

		await this.addTrack.execute(
			{
				guildId: message.guild?.id,
				keyword,
				textChannel: message.channel instanceof TextChannel ? message.channel : undefined,
				voiceChannel: message.member?.voice.channel || undefined,
			},
			{ userId: message.author.id }
		);
	}
}
