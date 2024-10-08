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

let map = new Map();

if (!fs.existsSync('file_system_saves')) {
    fs.mkdirSync('file_system_saves');
}

async function initializeFileStructure(guild) {
    const channels = guild.channels.cache.filter(channel => channel.type === 0);
    const fileManagementSystem = new FileManagementSystem();
    map.set(guild.id, fileManagementSystem);

    const saveFilePath = path.join('file_system_saves', `${guild.id}.json`);

    // Create guild roles if they don't exist
    // console.log(guild.roles.cache)

    if (!guild.roles.cache.find(role => role.name === 'Admin')) {
        console.log('Creating admin role');
        guild.roles.create({ name: 'Admin', permissions: [], color: '#FF0000' });
    }

    if (!guild.roles.cache.find(role => role.name === 'Moderator')) {
        guild.roles.create({ name: 'Moderator', permissions: [], color: '#0000FF' });

    }

    if (!guild.roles.cache.find(role => role.name === 'User')) {
        let role = await guild.roles.create({ name: 'User', permissions: [], color: '#000000' });
        guild.members.fetch().then(members => {
            members.forEach(member => {
                if (!member.roles.cache.has(role.id)) {
                    member.roles.add(role).catch(console.error);
                }
            });
        }).catch(console.error);
    } else {
        let role = guild.roles.cache.find(role => role.name === 'User');
        guild.members.fetch().then(members => {
            members.forEach(member => {
                if (!member.roles.cache.has(role.id)) {
                    member.roles.add(role).catch(console.error);
                }
            });
        }).catch(console.error);
    }

    // check if filesavepath exists, if it does, load the file system from the save file
    if (fs.existsSync(saveFilePath)) {
        fileManagementSystem.loadFileSystem(saveFilePath);
        return;
    }


    // Create the file system structure from the discord channels and messages
    for (const [channelId, channel] of channels) {

        let lastMessageId;

        if (!fileManagementSystem.getDirectoryNode(channel.name)) {
            fileManagementSystem.createDirectory('', channel.name);
            console.log(`Created directory for channel: ${channel.name}`);
        }

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
                        const filePath = channel.name + '/' + fileType;

                        // Check if the directory exists, if not, create it
                        if (!fileManagementSystem.getDirectoryNodeByPath(filePath)) {
                            fileManagementSystem.createDirectory(channel.name, fileType);
                        }
                        // Insert the file into the appropriate directory
                        fileManagementSystem.insertFiles(filePath, [{ name: fileName, url: fileUrl, owner: message.author.id }]);
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

    let fileManagementSystem = map.get(interaction.guild.id);

    if (!fileManagementSystem) {
        await initializeFileStructure(interaction.guild);
        fileManagementSystem = map.get(interaction.guild.id);
    }

    const command = client.commands.get(interaction.commandName);

    if (!command) {
        return interaction.reply({ content: 'This command is not available.', ephemeral: true });
    }

    try {
        await command.execute(interaction, fileManagementSystem);
        const fileSavePath = path.join('file_system_saves', `${interaction.guild.id}.json`);
        fileManagementSystem.saveFileSystem(fileSavePath);
    } catch (error) {
        console.error(error);
        interaction.reply({ content: 'There was an error executing this command.', ephemeral: true });
    }
});

client.on(Events.MessageCreate, async message => {
    if (message.author.bot) return;

    const fileManagementSystem = map.get(message.guild.id);

    if (message.attachments.size > 0) {
        message.attachments.forEach(attachment => {
            const fileName = attachment.name;
            const fileUrl = attachment.url;
            const fileType = path.extname(fileName).substring(1);
            const filePath = fileType ? `${fileType}` : `other`;

            if (!fileManagementSystem.createDirectory(filePath)) {
                fileManagementSystem.createDirectory(filePath);
            }

            fileManagementSystem.insertFiles(filePath, [{ name: fileName, url: fileUrl, owner: message.author.id }]);

            message.reply({ content: `File "${fileName}" has been uploaded and processed.`, ephemeral: true });
        });
    }
});

// Listen for message delete events to handle file deletions
client.on(Events.MessageDelete, async message => {
    const fileManagementSystem = map.get(message.guild.id);
    if (message.attachments.size > 0 && fileManagementSystem) {
        message.attachments.forEach(attachment => {
            const fileUrl = attachment.url;
            fileManagementSystem.deleteFileByUrl(fileUrl);
        });
    }
});

client.login(process.env.DISCORD_TOKEN);
