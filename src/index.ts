import DiscordJS, { Intents } from 'discord.js';
import dotenv from 'dotenv';
import axios from 'axios';
import SteamAPI from 'steamapi';
import { dotaRank } from './config';
dotenv.config();

const client = new DiscordJS.Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});
const steam = new SteamAPI(process.env.STEAM_API_KEY);

client.on('ready', () => {
  console.log('Bot is ready');

  const guildId = '925109902643458088';
  const guild = client.guilds.cache.get(guildId);
  let commands;

  if (guild) {
    commands = guild.commands;
  } else {
    commands = client.application?.commands;
  }

  commands?.create({
    name: 'stats',
    description: 'Provide you statistics with your wins and losses',
    options: [
      {
        name: 'steam',
        description: 'User steam id',
        required: true,
        type: DiscordJS.Constants.ApplicationCommandOptionTypes.STRING,
      },
    ],
  });
});

function toSteam32Id(steam64Id: string): string {
  return (BigInt(steam64Id) - 76561197960265728n).toString();
}

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) {
    return;
  }

  const { commandName, options } = interaction;

  if (commandName === 'stats') {
    const steam64Id = await steam.resolve(options.getString('steam'));
    const steam32Id = toSteam32Id(steam64Id);

    await axios.post(`https://api.opendota.com/api/players/${steam32Id}/refresh`);

    const [winlose, accountInfo, playerHeroes, heroes] = await Promise.all([
      axios.get(`https://api.opendota.com/api/players/${steam32Id}/wl`).then((res) => res.data),
      axios.get(`https://api.opendota.com/api/players/${steam32Id}`).then((res) => res.data),
      axios.get(`https://api.opendota.com/api/players/${steam32Id}/heroes`).then((res) => res.data),
      axios.get('https://api.opendota.com/api/heroes').then((res) => res.data),
    ]);

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
      ].join('\n'),
      ephemeral: true,
    });
  }
});

client.login(process.env.DISCORD_TOKEN);
