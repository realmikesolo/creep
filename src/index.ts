import DiscordJS, { Intents } from 'discord.js';
import dotenv from 'dotenv';
import { StatsCommand } from './commands/bot';
dotenv.config();

const client = new DiscordJS.Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});

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

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) {
    return;
  }

  const { commandName } = interaction;

  if (commandName === 'stats') {
    const command = new StatsCommand();
    command.execute(interaction);
  }
});

client.login(process.env.DISCORD_TOKEN);
