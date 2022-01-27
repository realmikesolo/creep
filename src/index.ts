import DiscordJS, { Intents } from 'discord.js';
import dotenv from 'dotenv';
import { connect } from 'mongoose';
import { DotaAPI } from './api/dota';
import { HistoryCommand } from './commands/history';
import { StatsCommand } from './commands/stats';
import { UserModel } from './snapshot/schema/schema';
dotenv.config();

const client = new DiscordJS.Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});

client.on('ready', async () => {
  await connect(process.env.MONGODB_CONNECTION_URL);
  const snapshotTimer = setInterval(async () => {
    const users = await UserModel.find();
    console.log(users);
    for (let i = 0; i < users.length; i++) {
      const dota = new DotaAPI();

      const history = await dota.getWinlose(users[i].steamId);
      const lastSnapshot = users[i].snapshots[users[i].snapshots.length - 1];
      if (history.win === lastSnapshot.wins && history.lose === lastSnapshot.losses) continue;
      users[i].snapshots.push({
        wins: history.win,
        losses: history.lose,
      });
      await users[i].save();
    }
  }, 5000);
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
    name: 'history',
    description: 'Provide your match history',
    options: [
      {
        name: 'steam',
        description: 'User steam id',
        required: true,
        type: DiscordJS.Constants.ApplicationCommandOptionTypes.STRING,
      },
    ],
  });

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

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) {
    return;
  }

  const { commandName } = interaction;

  if (commandName === 'stats') {
    const command = new StatsCommand();
    command.execute(interaction);
  }
  if (commandName === 'history') {
    const command = new HistoryCommand();
    command.execute(interaction);
  }
});

client.login(process.env.DISCORD_TOKEN);
