import dotenv from 'dotenv';
dotenv.config();

import { Client, GatewayIntentBits, Events, Collection } from 'discord.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

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

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = await import(pathToFileURL(filePath).href);
    client.commands.set(command.data.name, command);
}

const dataFilePath = path.join(__dirname, 'fileSystem.json');

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
        },
        swagtastic: {
            type: 'folder',
            children: {}
        }
    };
}

function saveFileSystem() {
    fs.writeFileSync(dataFilePath, JSON.stringify(fileSystem, null, 2));
}

client.once(Events.ClientReady, readyClient => {
    console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const { commandName } = interaction;

    const command = client.commands.get(commandName);

    if (!command) {
        return interaction.reply({ content: 'This command is not available.', ephemeral: true });
    }

    try {
        await command.execute(interaction, fileSystem, saveFileSystem);
    } catch (error) {
        console.error(error);
        interaction.reply({ content: 'There was an error executing this command.', ephemeral: true });
    }
});

client.login(process.env.DISCORD_TOKEN);
