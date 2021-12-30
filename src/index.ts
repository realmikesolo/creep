import { info } from 'console';
import DiscordJS, { Intents } from 'discord.js';
import dotenv from 'dotenv';
import axios from 'axios';
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
  // commands?.create({
  //   name: 'ping',
  //   description: 'Replies with pong',
  // });

  // commands?.create({
  //   name: 'add',
  //   description: 'Adds two numbers',
  //   options: [
  //     {
  //       name: 'num1',
  //       description: 'The first number',
  //       required: true,
  //       type: DiscordJS.Constants.ApplicationCommandOptionTypes.NUMBER,
  //     },
  //     {
  //       name: 'num2',
  //       description: 'The second number',
  //       required: true,
  //       type: DiscordJS.Constants.ApplicationCommandOptionTypes.NUMBER,
  //     },
  //   ],
  // });

  commands?.create({
    name: 'recentmatch',
    description: 'Provide you statistics with your recent match',
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

  const { commandName, options } = interaction;

  if (commandName === 'recentmatch') {
    const data = await axios
      .get(`https://api.opendota.com/api/players/${options.getString('steam')}/recentMatches`)
      .then((res) => res.data);

    console.log(data);

    interaction.reply({
      content: `Id: ${data[0].match_id} \nDuration: ${data[0].duration}  `,
      ephemeral: true,
    });
  }
  // if (commandName === 'ping') {
  //   interaction.reply({
  //     content: 'pong',
  //     ephemeral: true,
  //   });
  // } else if (commandName === 'add') {
  //   interaction.reply({
  //     content: (options.getNumber('num1')! + options.getNumber('num2')!).toString(),
  //     ephemeral: true
  //   });
  // }
});

client.login(process.env.TOKEN);
