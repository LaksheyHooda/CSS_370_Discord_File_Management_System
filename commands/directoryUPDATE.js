import { SlashCommandBuilder } from 'discord.js';
import { validatePath } from '../utils/validatePath.js';

export const data = new SlashCommandBuilder()
    .setName('updatedirectory')
    .setDescription('Update the name of an existing directory')
    .addStringOption(option =>
        option.setName('path')
            .setDescription('The path to the directory to update {Example: "myfolder/subfolder"}')
            .setRequired(true))
    .addStringOption(option =>
        option.setName('newname')
            .setDescription('The new name for the directory {Example: "newname"}')
            .setRequired(true));

export async function execute(interaction, FileManagementSystem) {
    let pathOption = interaction.options.getString('path');
    const newName = interaction.options.getString('newname');

    const member = interaction.guild.members.cache.get(interaction.user.id);
    const isServerAdmin= member.permissions.has('ADMINISTRATOR');
    if (!isServerAdmin) {
        return interaction.reply({ content: 'You do not have permission to create directories.', ephemeral: true });
    }

    try {
        pathOption = await validatePath(interaction, FileManagementSystem, pathOption);
        if (pathOption === '' || pathOption === 'root') {
            return interaction.reply({ content: 'You cannot update the root directory.', ephemeral: true });
        }
        FileManagementSystem.renameDirectory(pathOption, newName);
        return interaction.reply({ content: `Directory name updated successfully to "${newName}" at path "${pathOption}".`, ephemeral: true });
    } catch (error) {
        console.error(error);
        interaction.reply({ content: `An error occurred while updating the directory: ${error.message}`, ephemeral: true });
    }
}
