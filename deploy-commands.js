import dotenv from 'dotenv';
dotenv.config();

import { REST, Routes } from 'discord.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

// ES module equivalents of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = await import(pathToFileURL(filePath).href);
    if ('data' in command && 'execute' in command) {
        commands.push(command.data.toJSON());
    } else {
        console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
}

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
    try {
        console.log(`Started refreshing ${commands.length} application (/) commands.`);

        // Deploying commands to a specific guild
        const data = await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
            { body: commands },
        );

        console.log(`Successfully reloaded ${data.length} application (/) commands in guild ${process.env.GUILD_ID}.`);
    } catch (error) {
        console.error(error);
    }
})();
