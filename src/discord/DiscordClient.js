import Logger from '../component/Logger.js';
import path from 'path';
import { readdir } from 'fs/promises';
import { Client, Collection } from 'discord.js';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';

const log = new Logger('client.discord');

export default class DiscordClient extends Client {
  #appID;
  #channelID;
  #commands;
  #tokenSettedRest;

  constructor(options) {
    super(options.option);
    this.token = options.token;
    this.#appID = options.appID;
    this.#channelID = options.channelID;
    this.#commands = new Collection();
    this.#tokenSettedRest = new REST({ version: 9 }).setToken(this.token);
  }

  setup() {
    this.#setupCommands();
    this.#setupEvents();
  }

  #setupCommands() {
    const cmdPath = path.join(path.resolve(), 'src', 'discord', 'command');

    readdir(cmdPath)
      .then((fileNames) =>
        fileNames.forEach((fileName) =>
          import(`./command/${fileName}`)
            .then((cmd) => this.#commands.set(cmd.name, cmd))
            .catch(log.error.bind(log))
        )
      )
      .catch(log.error.bind(log));
  }

  #setupEvents() {
    this.once('ready', (client) => {
      client.user.setActivity('guild.messages', { type: 'WATCHING' });
      client.user.setStatus('online');
      this.guilds
        .fetch({ limit: 200 })
        .then((guildCollection) =>
          guildCollection.each((guild) =>
            this.#tokenSettedRest.put(
              Routes.applicationGuildCommands(this.#appID, guild.id),
              {
                body: this.#commands.map((cmdModule) => cmdModule.slashBuilder),
              }
            )
          )
        )
        .catch(log.error.bind(log));
      log.info(`Logged in Discord as user ${client.user.tag}`);
    });

    this.on('messageCreate', (message) => {
      if (message.author.bot) return;
      if (message.channel.id === this.#channelID) return;
      if (message.channel.name.indexOf('명령어') !== -1) return;
      if (
        /((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|v\/)?)([\w\-]+)(\S+)?/gm.test(
          message.content
        )
      ) {
        message
          .delete()
          .then(() =>
            message.guild.channels
              .fetch(this.#channelID)
              .then((channel) =>
                channel
                  .send(`메시지 내용: ${message.content}`)
                  .then((newMessage) =>
                    message.channel
                      .send(
                        `메시지를 이동했습니다.\n이동된 메시지: ${newMessage.url}`
                      )
                      .then((newMessage2) =>
                        newMessage.edit(
                          `메시지 내용: ${message.content}\n메시지가 보내진 시점: ${newMessage2.url}`
                        )
                      )
                  )
              )
          );
      }
    });

    this.on('interactionCreate', (interaction) => {
      if (!interaction.isCommand) return;
      const command = this.#commands.get(interaction.commandName);
      command.run(interaction, this);
    });
  }
}
