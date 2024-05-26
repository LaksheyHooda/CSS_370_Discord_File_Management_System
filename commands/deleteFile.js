import { SlashCommandBuilder } from 'discord.js';
import { validatePath } from '../utils/validatePath.js'; // Import the utility function

export const data = new SlashCommandBuilder()
    .setName('deletefile')
    .setDescription('Delete a file from a specified path')
    .addStringOption(option =>
        option.setName('filename')
            .setDescription('The name of the file to delete')
            .setRequired(true))
    .addStringOption(option =>
        option.setName('path')
            .setDescription('The path where the file is located')
            .setRequired(false));

export async function execute(interaction, FileManagementSystem) {
    const fileName = interaction.options.getString('filename');
    let pathOption = interaction.options.getString('path') || ''; // Default to an empty string

    try {
        pathOption = await validatePath(interaction, FileManagementSystem, pathOption);

        FileManagementSystem.deleteFile(pathOption, fileName);
        return interaction.reply({ content: `File "${fileName}" deleted successfully from path "${pathOption}".`, ephemeral: true });
    } catch (error) {
        console.error(error);
    }
}
