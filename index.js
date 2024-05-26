import { Client, GatewayIntentBits, Collection, Events } from 'discord.js';

import { fileURLToPath, pathToFileURL } from 'url';
import path from 'path';

import FileManagementSystem from './utils/FileManagementSystem.js';
import fs from 'fs';

import dotenv from 'dotenv';
dotenv.config();

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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
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
            if (messages.size === 0) break;

            for (const message of messages.values()) {
                if (message.attachments.size > 0) {
                    message.attachments.forEach(attachment => {
                        const fileName = attachment.name;
                        const fileUrl = attachment.url;
                        const fileType = path.extname(fileName).substring(1) || 'other';
                        
                        // Check if the directory exists, if not, create it
                        if (!fileManagementSystem.getDirectoryNode(fileType)) {
                            fileManagementSystem.createDirectory('', fileType);
                        }
                        
                        // Insert the file into the appropriate directory
                        fileManagementSystem.insertFiles(fileType, [{ name: fileName, url: fileUrl, owner: message.author.id }]);
                    });
                }
            }

            lastMessageId = messages.last().id;
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

client.on(Events.MessageCreate, async message => {
    if (message.author.bot) return;

    if (message.attachments.size > 0) {
        message.attachments.forEach(attachment => {
            const fileName = attachment.name;
            const fileUrl = attachment.url;
            const fileType = path.extname(fileName).substring(1);
            const filePath = fileType ? `${fileType}` : `other`;

            if (!fileManagementSystem.createDirectory(filePath)) {
                fileManagementSystem.createDirectory(filePath);
            }

            fileManagementSystem.insertFile(filePath, fileName, fileUrl);

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
