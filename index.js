import dotenv from 'dotenv';
dotenv.config();

import { Client, GatewayIntentBits, Events, SlashCommandBuilder, Collection } from 'discord.js';
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';


const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.MessageContent,
    ],
    partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
});

client.commands = new Collection();

const foldersPath = path.join('commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = await import(`./${filePath}`);
        // Set a new item in the Collection with the key as the command name and the value as the exported module
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
        } else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
}

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
        } else {
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    }
});

client.on(Events.MessageCreate, async (message) => {
    console.log(message.content);
    if (!message.author.bot) {

        if (message.attachments.size > 0) {
            message.attachments.forEach(async (attachment) => {
                // Log each attachment URL
                console.log(attachment.url);
                const filename = path.basename(attachment.url);
                const filepath = path.join('local_downloads', filename);

                // Ensure the directory exists
                fs.mkdirSync(path.dirname(filepath), { recursive: true });

                // Fetch the attachment using node-fetch and save it locally
                const response = await fetch(attachment.url);
                const buffer = await response.buffer();
                fs.writeFile(filepath, buffer, () =>
                    console.log(`Downloaded and saved attachment to ${filepath}`)
                );

                message.channel.send(`Attachment received: ${attachment.url}`);
            });
        }
    }
});

client.once(Events.ClientReady, readyClient => {
    console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

client.login(process.env.DISCORD_TOKEN);