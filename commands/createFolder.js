import { SlashCommandBuilder } from 'discord.js';
import { validatePath } from '../utils/validatePath.js'; // Import the utility function

export const data = new SlashCommandBuilder()
    .setName('createfolder')
    .setDescription('Create a new folder with attachments if provided')
    .addStringOption(option =>
        option.setName('foldername')
            .setDescription('The name of the folder to create')
            .setRequired(true))
    .addStringOption(option =>
        option.setName('path')
            .setDescription('The path where the folder should be created')
            .setRequired(false));

export async function execute(interaction, FileManagementSystem) {
    const folderName = interaction.options.getString('foldername');
    let pathOption = interaction.options.getString('path') || ''; // Default to an empty string

    try {
        pathOption = await validatePath(interaction, FileManagementSystem, pathOption);

        const fullPath = pathOption ? `${pathOption}/${folderName}` : folderName;
        FileManagementSystem.createFolder(fullPath);

        if (attachments.size > 0) {
            for (const attachment of attachments.values()) {
                FileManagementSystem.createFile(fullPath, attachment.name, attachment.url);
            }
        }

        return interaction.reply({ content: `Folder "${folderName}" created successfully at path "${pathOption}" with attachments.`, ephemeral: true });
    } catch (error) {
        console.error(error);
    }
}
