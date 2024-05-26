import dotenv from 'dotenv';
dotenv.config();

import { Client, GatewayIntentBits, Collection, Events } from 'discord.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import FileManagementSystem from './FileManagementSystem.js';
import { searchForFileInServer } from './utils/searchForFileInServer.js'; // Import the utility function

// ES module equivalents of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages,
    ],
    partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
});

client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = await import(pathToFileURL(filePath).href);
    client.commands.set(command.data.name, command);
}

const fileManagementSystem = new FileManagementSystem();

async function initializeFileStructure(guild) {
    const channels = guild.channels.cache.filter(channel => channel.isTextBased());

    for (const [channelId, channel] of channels) {
        let lastMessageId;
        while (true) {
            const options = { limit: 100 };
            if (lastMessageId) {
                options.before = lastMessageId;
            }

            const messages = await channel.messages.fetch(options);
            if (messages.size === 0) {
                break;
            }

            for (const message of messages.values()) {
                if (message.attachments.size > 0) {
                    message.attachments.forEach(attachment => {
                        const fileName = attachment.name;
                        const fileUrl = attachment.url;
                        const pathOption = ''; // Default to an empty string for root
                        fileManagementSystem.createFile(pathOption, fileName, fileUrl);
                    });
                }
            }

            lastMessageId = messages.last().id;
            // Delay to avoid hitting rate limits
            await new Promise(resolve => setTimeout(resolve, 1200));
        }
    }
}

client.once(Events.ClientReady, async () => {
    console.log(`Ready! Logged in as ${client.user.tag}`);

    for (const guild of client.guilds.cache.values()) {
        await initializeFileStructure(guild);
    }
});

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) {
        return interaction.reply({ content: 'This command is not available.', ephemeral: true });
    }

    try {
        await command.execute(interaction, fileManagementSystem);
    } catch (error) {
        console.error(error);
        interaction.reply({ content: 'There was an error executing this command.', ephemeral: true });
    }
});

// Listen for message events to handle file uploads
client.on(Events.MessageCreate, async message => {
    if (message.author.bot) return; // Ignore bot messages

    // Check for attachments
    if (message.attachments.size > 0) {
        message.attachments.forEach(attachment => {
            // Process each file attachment
            const fileName = attachment.name;
            const fileUrl = attachment.url;

            // Set the path to root
            const pathOption = ''; // Default to an empty string for root
            fileManagementSystem.createFile(pathOption, fileName, fileUrl);

            message.reply({ content: `File "${fileName}" has been uploaded and processed.`, ephemeral: true });
        });
    }
});

// Listen for message delete events to handle file deletions
client.on(Events.MessageDelete, async message => {
    if (message.attachments.size > 0) {
        message.attachments.forEach(attachment => {
            const fileUrl = attachment.url;
            fileManagementSystem.deleteFileByUrl(fileUrl);
        });
    }
});

client.login(process.env.DISCORD_TOKEN);
