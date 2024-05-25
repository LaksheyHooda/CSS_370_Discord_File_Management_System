import dotenv from 'dotenv';
dotenv.config();

import { Client, GatewayIntentBits, Events, Collection } from 'discord.js';
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';

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
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
        } else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
}

mongoose.connect('mongodb://localhost:27017/discord-file-manager', { useNewUrlParser: true, useUnifiedTopology: true });

const fileSchema = new mongoose.Schema({
    fileName: String,
    uploadDate: Date,
    tags: [String],
    uploader: String,
    permissions: [String],
    type: { type: String, enum: ['file', 'folder'], default: 'file' },
    path: { type: String, default: '' } // The path where the file/folder is located
});

const File = mongoose.model('File', fileSchema);

function generateASCIITree(items) {
    const buildTree = (items, path = '') => {
        let tree = '';
        const folderItems = items.filter(item => item.type === 'folder' && item.path === path);
        const fileItems = items.filter(item => item.type === 'file' && item.path === path);

        folderItems.forEach(folder => {
            const folderPath = `${path}${folder.fileName}/`;
            tree += `${' '.repeat(path.split('/').length - 1)}|-- ${folder.fileName}/\n`;
            tree += buildTree(items, folderPath);
        });

        fileItems.forEach(file => {
            tree += `${' '.repeat(path.split('/').length - 1)}|-- ${file.fileName}\n`;
        });

        return tree;
    };

    return buildTree(items);
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
    if (message.content.startsWith('!createfolder')) {
        const args = message.content.split(' ');
        const folderName = args[1];
        const path = args[2] || ''; // Optional path argument

        if (!folderName) {
            return message.channel.send('Please provide a folder name.');
        }

        const existingFolder = await File.findOne({ fileName: folderName, path, type: 'folder' });
        if (existingFolder) {
            return message.channel.send('A folder with that name already exists in the specified path.');
        }

        const newFolder = new File({
            fileName: folderName,
            type: 'folder',
            path: path,
            uploader: message.author.username,
            permissions: ['admin', 'moderator']
        });
        await newFolder.save();
        message.channel.send(`Folder ${folderName} created successfully at path ${path}.`);
    }

    if (message.content.startsWith('!myfiles')) {
        const files = await File.find({});
        const tree = generateASCIITree(files);
        message.channel.send(`\`\`\`\n${tree}\n\`\`\``);
    }

    if (!message.author.bot && message.attachments.size > 0) {
        message.attachments.forEach(async (attachment) => {
            const filename = path.basename(attachment.url);
            const filepath = path.join('local_downloads', filename);

            fs.mkdirSync(path.dirname(filepath), { recursive: true });

            const response = await fetch(attachment.url);
            const buffer = await response.buffer();
            fs.writeFile(filepath, buffer, () =>
                console.log(`Downloaded and saved attachment to ${filepath}`)
            );

            const newFile = new File({
                fileName: filename,
                uploadDate: new Date(),
                tags: [], // Tags can be added via another command
                uploader: message.author.username,
                permissions: ['admin', 'moderator'],
                type: 'file',
                path: '' // Root path
            });
            await newFile.save();
            message.channel.send(`Attachment received: ${attachment.url}`);
        });
    }
});

client.once(Events.ClientReady, readyClient => {
    console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

client.login(process.env.DISCORD_TOKEN);