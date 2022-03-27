import { GetLyricUseCase, Lyric } from "@modules/lyric";
import { GetNowPlayingLyricUseCase } from "@modules/queue";
import { MessageEmbed } from "discord.js";
import { inject, injectable } from "tsyringe";
import { CommandExecuteProps, ICommand } from "../core";

@injectable()
export class LyricCommand implements ICommand {
	public readonly name = "lyric";
	public readonly description = "Get lyric of current playing song or by keyword";

	constructor(
		@inject(GetLyricUseCase) private getLyric: GetLyricUseCase,
		@inject(GetNowPlayingLyricUseCase)
		private getNowPlayingLyric: GetNowPlayingLyricUseCase
	) {}

	public async execute({ message, args }: CommandExecuteProps): Promise<void> {
		const keyword = args.join(" ");

		let lyric: Lyric;

		if (keyword) {
			lyric = await this.getLyric.execute({ keyword }, { userId: message.author.id });
		} else {
			lyric = await this.getNowPlayingLyric.execute(
				{ guildId: message.guild?.id },
				{ userId: message.author.id }
			);
		}

		let maxLength = 4096;
		maxLength -= lyric.sourceUrl.length - 16;

		const embed = new MessageEmbed({
			title: `${lyric.author} — ${lyric.title}`,
			description: [
				lyric.sourceUrl,
				"",
				lyric.content.length > maxLength
					? lyric.content.slice(0, maxLength) + "..."
					: lyric.content,
			].join("\n"),
		});

		await message.reply({ embeds: [embed] });
	}
}
