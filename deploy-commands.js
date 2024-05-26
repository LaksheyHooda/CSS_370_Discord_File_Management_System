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

async function deleteExistingCommands() {
    try {
        console.log('Started deleting all application (/) commands.');

        // Retrieve all existing commands
        const existingCommands = await rest.get(
            Routes.applicationCommands(process.env.CLIENT_ID)
        );

        const deletePromises = existingCommands.map(command => {
            console.log(`Deleting command: ${command.name}`);
            return rest.delete(
                Routes.applicationCommand(process.env.CLIENT_ID, command.id)
            );
        });

        await Promise.all(deletePromises);
        console.log('Successfully deleted all application (/) commands.');

        // If using guild-specific commands, delete them as well
        if (process.env.GUILD_ID) {
            console.log('Started deleting all guild (/) commands.');

            const existingGuildCommands = await rest.get(
                Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID)
            );

            const deleteGuildPromises = existingGuildCommands.map(command => {
                console.log(`Deleting guild command: ${command.name}`);
                return rest.delete(
                    Routes.applicationGuildCommand(process.env.CLIENT_ID, process.env.GUILD_ID, command.id)
                );
            });

            await Promise.all(deleteGuildPromises);
            console.log('Successfully deleted all guild (/) commands.');
        }
    } catch (error) {
        console.error('Error deleting commands:', error);
    }
}

async function deployCommands() {
    try {
        // Delete existing commands
        await deleteExistingCommands();

        // Deploy new commands in a single batch
        console.log(`Started refreshing ${commands.length} application (/) commands.`);
        const data = await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: commands },
        );
        console.log(`Successfully reloaded ${data.length} application (/) commands.`);

        // If using guild-specific commands, deploy them as well in a single batch
        if (process.env.GUILD_ID) {
            console.log(`Started refreshing ${commands.length} guild (/) commands.`);
            const guildData = await rest.put(
                Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
                { body: commands },
            );
            console.log(`Successfully reloaded ${guildData.length} guild (/) commands.`);
        }

        console.log('Successfully reloaded all application (/) and guild (/) commands.');
    } catch (error) {
        console.error('Error during deployment:', error);
    }
}

deployCommands();
