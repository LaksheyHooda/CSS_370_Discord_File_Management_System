import { SlashCommandBuilder } from 'discord.js';
import { validatePath } from '../utils/validatePath.js';

export const data = new SlashCommandBuilder()
    .setName('createdirectory')
    .setDescription('[ADMIN ONLY] Create a new directory in the file structure')
    .addStringOption(option =>
        option.setName('name')
            .setDescription('The name of the new directory [Example: "newDirectory"]')
            .setRequired(true))
    .addStringOption(option =>
        option.setName('path')
            .setDescription('The path where the new directory should be created {Default is root} [Example: "myfolder/subfolder"]')
            .setRequired(false));

export async function execute(interaction, FileManagementSystem) {
    const pathOption = interaction.options.getString('path') || ''; // Default to root
    const dirName = interaction.options.getString('name');

    const member = interaction.guild.members.cache.get(interaction.user.id);
    const isServerAdmin= member.permissions.has('ADMINISTRATOR');

    if (!isServerAdmin) {
        return interaction.reply({ content: 'You do not have permission to create directories.', ephemeral: true });
    }

    try {
        const validPath = await validatePath(interaction, FileManagementSystem, pathOption);
        FileManagementSystem.createDirectory(validPath, dirName);

        return interaction.reply({ content: `Directory "${dirName}" created successfully at path "${validPath}".`, ephemeral: true });
    } catch (error) {
        console.error(error);
        return interaction.reply({ content: `There was an error creating the directory: ${error.message}`, ephemeral: true });
    }
}