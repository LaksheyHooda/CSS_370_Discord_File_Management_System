import { SlashCommandBuilder } from 'discord.js';
import { validatePath } from '../utils/validatePath.js'; // Import the utility function

export const data = new SlashCommandBuilder()
    .setName('movefile')
    .setDescription('Move a file to a new location')
    .addStringOption(option =>
        option.setName('sourcepath')
            .setDescription('The current path of the file')
            .setRequired(true))
    .addStringOption(option =>
        option.setName('destinationpath')
            .setDescription('The new path for the file')
            .setRequired(true))
    .addStringOption(option =>
        option.setName('filename')
            .setDescription('The name of the file to move')
            .setRequired(true));

export async function execute(interaction, FileManagementSystem) {
    const sourcePath = interaction.options.getString('sourcepath');
    const destinationPath = interaction.options.getString('destinationpath');
    const fileName = interaction.options.getString('filename');

    try {
        const validSourcePath = await validatePath(interaction, FileManagementSystem, sourcePath);
        const validDestinationPath = await validatePath(interaction, FileManagementSystem, destinationPath);

        FileManagementSystem.moveFile(validSourcePath, validDestinationPath, fileName);
        return interaction.reply({ content: `File "${fileName}" moved successfully from "${validSourcePath}" to "${validDestinationPath}".`, ephemeral: true });
    } catch (error) {
        console.error(error);
    }
}
