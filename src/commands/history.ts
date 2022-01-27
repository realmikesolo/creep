import axios from 'axios';
import DiscordJS from 'discord.js';
import { SteamAPI } from '../api/steam';
import { DotaAPI } from '../api/dota';
import { UserModel } from '../snapshot/schema/schema';
export class HistoryCommand {
  public async execute(interaction: DiscordJS.CommandInteraction<DiscordJS.CacheType>) {
    const { options } = interaction;
    const steam = new SteamAPI();
    const dota = new DotaAPI();

    const steam64Id = await steam.resolve(options.getString('steam')!);
    const steam32Id = steam.toSteam32Id(steam64Id);
    await axios.post(`https://api.opendota.com/api/players/${steam32Id}/refresh`);
    const history = await dota.getWinlose(steam32Id);
    const UserSchema = {
      steamId: steam32Id,
      snapshots: [
        {
          wins: history.win,
          losses: history.lose,
        },
        {
          wins: history.win + 1,
          losses: history.lose,
        },
        {
          wins: history.win + 4,
          losses: history.lose,
        },
      ],
    };
    const user = await UserModel.findOne({ steamId: steam32Id });
    if (!user) {
      await UserModel.create(UserSchema);
      interaction.reply({
        content: 'Congratulations! Now we follow your statistics',
        ephemeral: true,
      });
    } else {
      const stats: string[] = [];
      for (let i = user.snapshots.length - 1; i >= 1; i--) {
        const result = [
          {
            wins: user.snapshots[i].wins - user.snapshots[i - 1].wins,
            losses: user.snapshots[i].losses - user.snapshots[i - 1].losses,
          },
        ];
        if (result[0].wins > 0) {
          stats.push('Win ');
        } else if (result[0].losses > 0) {
          stats.push('Lose ');
        }
        console.log(result);
      }
      console.log(stats);
      const output = stats.join('\n');
      interaction.reply({
        content: output,
        ephemeral: true,
      });
    }
  }
}
