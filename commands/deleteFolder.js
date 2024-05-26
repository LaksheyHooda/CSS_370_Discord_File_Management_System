import { SlashCommandBuilder } from 'discord.js';
import { validatePath } from '../utils/validatePath.js'; // Import the utility function

export const data = new SlashCommandBuilder()
    .setName('deletefolder')
    .setDescription('Delete a folder from a specified path')
    .addStringOption(option =>
        option.setName('foldername')
            .setDescription('The name of the folder to delete')
            .setRequired(true))
    .addStringOption(option =>
        option.setName('path')
            .setDescription('The path where the folder is located')
            .setRequired(false));

export async function execute(interaction, FileManagementSystem) {
    const folderName = interaction.options.getString('foldername');
    let pathOption = interaction.options.getString('path') || ''; // Default to an empty string

    try {
        pathOption = await validatePath(interaction, FileManagementSystem, pathOption);

        const fullPath = pathOption ? `${pathOption}/${folderName}` : folderName;
        FileManagementSystem.deleteFolder(fullPath);
        return interaction.reply({ content: `Folder "${folderName}" deleted successfully from path "${pathOption}".`, ephemeral: true });
    } catch (error) {
        console.error(error);
    }
}
