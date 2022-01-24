import axios from 'axios';
import DiscordJS from 'discord.js';
import { dotaRank } from '../config';
import { SteamAPI } from '../api/steam';
import { DotaAPI } from '../api/dota';
export class StatsCommand {
  public async execute(interaction: DiscordJS.CommandInteraction<DiscordJS.CacheType>) {
    const { options } = interaction;
    const steam = new SteamAPI();
    const dota = new DotaAPI();
    const steam64Id = await steam.resolve(options.getString('steam')!);
    const steam32Id = steam.toSteam32Id(steam64Id);

    await axios.post(`https://api.opendota.com/api/players/${steam32Id}/refresh`);

    const [winlose, accountInfo, playerHeroes, heroes, match] = await Promise.all([
      dota.getWinlose(steam32Id),
      dota.getAccountInfo(steam32Id),
      dota.getPlayerHeroes(steam32Id),
      dota.getHeroes(),
      dota.getMatch(steam32Id),
    ]);

    const date = await dota.getDate(match[0].match_id);
    const lastMatchDate = new Date(date.start_time * 1000);
    // console.log(lastMatchDate);
    interaction.reply({
      content: [
        `AccoundId: ${accountInfo.profile.account_id}`,
        `Nickname: ${accountInfo.profile.personaname}`,
        `Rank: ${dotaRank[Math.floor(accountInfo.rank_tier / 10) - 1]} ${
          accountInfo.rank_tier % 10 === 0 ? accountInfo.leaderboard_rank : accountInfo.rank_tier % 10
        } `,
        `Wins: ${winlose.win}`,
        `Loses: ${winlose.lose}`,
        `Winrate: ${Math.floor(((winlose.win * 100) / (winlose.win + winlose.lose)) * 10) / 10}%`,
        `Most played heroes: ${heroes.find(({ id }) => id === +playerHeroes[0].hero_id).localized_name}, ${
          heroes.find(({ id }) => id === +playerHeroes[1].hero_id).localized_name
        }, ${heroes.find(({ id }) => id === +playerHeroes[2].hero_id).localized_name}`,
        `Last played match: ${match[0].match_id} was played ${lastMatchDate.getDate()}/${
          lastMatchDate.getMonth() + 1
        }/${lastMatchDate.getFullYear()}`,
      ].join('\n'),
      ephemeral: true,
    });
  }
}
