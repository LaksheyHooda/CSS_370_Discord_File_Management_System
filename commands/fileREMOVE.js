import { SlashCommandBuilder } from 'discord.js';
import { validatePath } from '../utils/validatePath.js';

export const data = new SlashCommandBuilder()
    .setName('removefle')
    .setDescription('Delete an existing file from your server file structure')
    .addStringOption(option =>
        option.setName('path')
            .setDescription('The path where the file is located [Example: "/folder/subfolder1/subfolder2"]')
            .setRequired(true))
    .addStringOption(option =>
        option.setName('filename')
            .setDescription('The name of the file to be deleted [Example: "myfile.txt"]')
            .setRequired(true));

export async function execute(interaction, FileManagementSystem) {
    const fileName = interaction.options.getString('filename');
    let pathOption = interaction.options.getString('path') || '';

    try {
        pathOption = await validatePath(interaction, FileManagementSystem, pathOption);

        FileManagementSystem.deleteFile(pathOption, fileName);
        return interaction.reply({ content: `File "${fileName}" deleted successfully from path "${pathOption}".`, ephemeral: true });
    } catch (error) {
        console.error(error);
        interaction.reply({ content: 'An error occurred while deleting the file.', ephemeral: true });
    }
}
