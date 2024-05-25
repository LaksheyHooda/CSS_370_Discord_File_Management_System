import dotenv from 'dotenv';
dotenv.config();

import { Client, GatewayIntentBits, Events, Collection } from 'discord.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ES module equivalents of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

const dataFilePath = path.join(__dirname, 'fileSystem.json');

// Load the file system from the JSON file
let fileSystem;
if (fs.existsSync(dataFilePath)) {
    const data = fs.readFileSync(dataFilePath);
    fileSystem = JSON.parse(data);
} else {
    fileSystem = {
        Projects: {
            type: 'folder',
            children: {}
        },
        Personal: {
            type: 'folder',
            children: {}
        }
    };
}

// Save the file system to the JSON file
function saveFileSystem() {
    fs.writeFileSync(dataFilePath, JSON.stringify(fileSystem, null, 2));
}

// Function to generate ASCII tree
function generateASCIITree(node, depth = 0) {
    let tree = '';
    for (const [key, value] of Object.entries(node)) {
        if (value.type === 'folder') {
            tree += `${' '.repeat(depth)}|-- ${key}/\n`;
            tree += generateASCIITree(value.children, depth + 2);
        } else {
            tree += `${' '.repeat(depth)}|-- ${key}\n`;
        }
    }
    return tree;
}

const commandCooldowns = new Map();

client.once(Events.ClientReady, readyClient => {
    console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const { commandName, options, user } = interaction;

    // Rate limiting
    if (!commandCooldowns.has(user.id)) {
        commandCooldowns.set(user.id, new Date().getTime());
    } else {
        const lastCommandTime = commandCooldowns.get(user.id);
        const now = new Date().getTime();
        if (now - lastCommandTime < 3000) { // 3 second cooldown
            return interaction.reply('You are sending commands too quickly. Please wait a moment.');
        }
        commandCooldowns.set(user.id, now);
    }

    try {
        if (commandName === 'createfolder') {
            const folderName = options.getString('foldername');
            const pathOption = options.getString('path') || '';
            const paths = pathOption.split('/').filter(Boolean);
            let current = fileSystem;

            for (const p of paths) {
                if (!current[p] || current[p].type !== 'folder') {
                    return interaction.reply(`Path "${pathOption}" does not exist.`);
                }
                current = current[p].children;
            }

            if (current[folderName]) {
                return interaction.reply(`A folder with the name "${folderName}" already exists at path "${pathOption}".`);
            }

            current[folderName] = { type: 'folder', children: {} };
            saveFileSystem();
            interaction.reply(`Folder "${folderName}" created successfully at path "${pathOption}".`);
        }

        if (commandName === 'myfiles') {
            const tree = generateASCIITree(fileSystem);
            interaction.reply(`\`\`\`\n${tree}\n\`\`\``);
        }

        if (commandName === 'help') {
            const helpMessage = commands.map(cmd => `/${cmd.name} - ${cmd.description}`).join('\n');
            interaction.reply(`\`\`\`\n${helpMessage}\n\`\`\``);
        }
    } catch (error) {
        console.error(error);
        interaction.reply({ content: 'There was an error executing this command.', ephemeral: true });
    }
});

client.login(process.env.DISCORD_TOKEN);
