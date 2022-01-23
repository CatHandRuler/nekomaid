import NekoMaid from './src/discord/DiscordClient.js';
import { Intents } from 'discord.js';

const neko = new NekoMaid({
  option: { intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] },
  token: process.env.DISCORD_TOKEN,
  appID: process.env.DISCORD_ID,
  channelID: process.env.DISCORD_CHANNEL,
});

neko.setup();
neko.login();
