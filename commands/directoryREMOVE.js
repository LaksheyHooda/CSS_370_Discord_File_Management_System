import { SlashCommandBuilder } from 'discord.js';
import { validatePath } from '../utils/validatePath.js';

export const data = new SlashCommandBuilder()
    .setName('removedirectory')
    .setDescription('Remove an existing directory and all subdirectories from the file structure')
    .addStringOption(option =>
        option.setName('path')
            .setDescription('The path where the folder is located [Example: "myfolder/subfolder"]')
            .setRequired(true))

export async function execute(interaction, FileManagementSystem) {
    let pathOption = interaction.options.getString('path');

    const member = interaction.guild.members.cache.get(interaction.user.id);
    const isServerAdmin= member.permissions.has('ADMINISTRATOR');
    if (!isServerAdmin) {
        return interaction.reply({ content: 'You do not have permission to create directories.', ephemeral: true });
    }

    try {
        pathOption = await validatePath(interaction, FileManagementSystem, pathOption);

        if (pathOption === '' || pathOption === 'root') {
            return interaction.reply({ content: 'You cannot delete the root directory.', ephemeral: true });
        }

        // Delete the folder and its contents
        await FileManagementSystem.deleteDirectory(pathOption, interaction.guild);

        return interaction.reply({ content: `Directory successfully deleted from path "${pathOption}" including all files and nested directory contents.`, ephemeral: true });
    } catch (error) {
        console.error(error);
        interaction.reply({ content: `An error occurred while deleting the directory: ${error.message}`, ephemeral: true });
    }
}
