import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
    .setName('movefile')
    .setDescription('Move a file to a new location')
    .addStringOption(option =>
        option.setName('sourcepath')
            .setDescription('The current path of the file')
            .setRequired (true))
    .addStringOption(option =>
        option.setName('destinationpath')
            .setDescription('The new path for the file')
            .setRequired (true))
    .addStringOption(option =>
        option.setName('filename')
            .setDescription('The name of the file to move')
            .setRequired (true));

export async function execute(interaction, FileManagementSystem) {
    const sourcePath = interaction.options.getString('sourcepath');
    const destinationPath = interaction.options.getString('destinationpath');
    const fileName = interaction.options.getString('filename');

    // Validate the source path
    while (!FileManagementSystem.validatePath(sourcePath)) {
        await interaction.reply({ content: `The source path "${sourcePath}" does not exist. Please provide a valid path.`, ephemeral: true });
        // Wait for user response and update sourcePath
        // This requires implementation for waiting and getting user response, which Discord.js does not natively support directly in slash commands
        // You might need to handle this with a message collector or similar approach
    }

    // Validate the destination path
    while (!FileManagementSystem.validatePath(destinationPath)) {
        await interaction.reply({ content: `The destination path "${destinationPath}" does not exist. Please provide a valid path.`, ephemeral: true });
        // Wait for user response and update destinationPath
        // This requires implementation for waiting and getting user response, which Discord.js does not natively support directly in slash commands
        // You might need to handle this with a message collector or similar approach
    }

    FileManagementSystem.moveFile(sourcePath, destinationPath, fileName);
    return interaction.reply({ content: `File "${fileName}" moved successfully from "${sourcePath}" to "${destinationPath}".`, ephemeral: true });
}
