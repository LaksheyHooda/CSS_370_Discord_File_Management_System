import { SlashCommandBuilder } from 'discord.js';

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

    // Validate the path
    while (!FileManagementSystem.validatePath(pathOption)) {
        await interaction.reply({ content: `The path "${pathOption}" does not exist. Please provide a valid path.`, ephemeral: true });
        // Wait for user response and update pathOption
        // This requires implementation for waiting and getting user response, which Discord.js does not natively support directly in slash commands
        // You might need to handle this with a message collector or similar approach
    }

    FileManagementSystem.deleteFile(pathOption, fileName);
    return interaction.reply({ content: `File "${fileName}" deleted successfully from path "${pathOption}".`, ephemeral: true });
}
