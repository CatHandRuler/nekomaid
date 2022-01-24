import Logger from './src/component/Logger.js';
import NekoMaid from './src/discord/DiscordClient.js';
import { Intents } from 'discord.js';

const log = new Logger('process');
const neko = new NekoMaid({
  option: { intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] },
  token: process.env.DISCORD_TOKEN,
  appID: process.env.DISCORD_ID,
  channelID: process.env.DISCORD_CHANNEL,
});

log.info('process started');
neko.setup();
neko.login();
