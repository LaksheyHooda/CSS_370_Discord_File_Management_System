import { SlashCommandBuilder } from 'discord.js';
import { validatePath } from '../utils/validatePath.js'; // Import the utility function

export const data = new SlashCommandBuilder()
    .setName('createfile')
    .setDescription('Create a new file from an attachment or add multiple attachments to a new folder')
    .addAttachmentOption(option =>
        option.setName('file')
            .setDescription('The file to attach')
            .setRequired(true))
    .addStringOption(option =>
        option.setName('filename')
            .setDescription('The name of the file to create')
            .setRequired(false))
    .addStringOption(option =>
        option.setName('path')
            .setDescription('The path where the file should be created')
            .setRequired(false));

export async function execute(interaction, FileManagementSystem) {
    const fileNameOption = interaction.options.getString('filename');
    let pathOption = interaction.options.getString('path') || ''; // Default to an empty string
    const attachments = interaction.options.getAttachment('file') ? interaction.options.getAttachment('file') : interaction.message.attachments;

    try {
        pathOption = await validatePath(interaction, FileManagementSystem, pathOption);

        if (attachments.size === 1) {
            const attachment = attachments.first();
            const fileName = fileNameOption || attachment.name;
            FileManagementSystem.createFile(pathOption, fileName, attachment.url);
            return interaction.reply({ content: `File "${fileName}" created successfully at path "${pathOption}" with the attachment.`, ephemeral: true });
        } else {
            const folderName = fileNameOption || `NewFolder_${Date.now()}`;
            const fullPath = pathOption ? `${pathOption}/${folderName}` : folderName;
            FileManagementSystem.createFolder(fullPath);

            for (const attachment of attachments.values()) {
                FileManagementSystem.createFile(fullPath, attachment.name, attachment.url);
            }

            return interaction.reply({ content: `Folder "${folderName}" created successfully at path "${pathOption}" with attachments.`, ephemeral: true });
        }
    } catch (error) {
        console.error(error);
    }
}
