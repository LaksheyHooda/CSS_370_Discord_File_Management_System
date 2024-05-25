import dotenv from 'dotenv';
dotenv.config();

import { REST, Routes } from 'discord.js';

const commands = [
    {
        name: 'createfolder',
        description: 'Create a new folder',
        options: [
            {
                name: 'foldername',
                type: 3, // STRING type
                description: 'The name of the folder to create',
                required: true,
            },
            {
                name: 'path',
                type: 3, // STRING type
                description: 'The path where the folder should be created',
                required: false,
            }
        ]
    },
    {
        name: 'myfiles',
        description: 'Display your file structure'
    },
    {
        name: 'help',
        description: 'List all commands'
    }
];

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
    try {
        console.log(`Started refreshing ${commands.length} application (/) commands.`);

        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: commands },
        );

        console.log(`Successfully reloaded application (/) commands.`);
    } catch (error) {
        console.error(error);
    }
})();
