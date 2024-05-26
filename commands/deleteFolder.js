import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
    .setName('deletefolder')
    .setDescription('Delete a folder from a specified path')
    .addStringOption(option =>
        option.setName('foldername')
            .setDescription('The name of the folder to delete')
            .setRequired (true))
    .addStringOption(option =>
        option.setName('path')
            .setDescription('The path where the folder is located')
            .setRequired (false));

export async function execute(interaction, FileManagementSystem) {
    const folderName = interaction.options.getString('foldername');
    let pathOption = interaction.options.getString('path') || ''; // Default to an empty string

    // Validate the path
    while (!FileManagementSystem.validatePath(pathOption)) {
        await interaction.reply({ content: `The path "${pathOption}" does not exist. Please provide a valid path.`, ephemeral: true });
        // Wait for user response and update pathOption
        // This requires implementation for waiting and getting user response, which Discord.js does not natively support directly in slash commands
        // You might need to handle this with a message collector or similar approach
    }

    const fullPath = pathOption ? `${pathOption}/${folderName}` : folderName;
    FileManagementSystem.deleteFolder(fullPath);
    return interaction.reply({ content: `Folder "${folderName}" deleted successfully from path "${pathOption}".`, ephemeral: true });
}
