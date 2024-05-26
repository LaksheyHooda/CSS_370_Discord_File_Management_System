import { SlashCommandBuilder } from 'discord.js';
import { validatePath } from '../utils/validatePath.js';
import { searchForFileInServer } from '../utils/searchForFileInServer.js'; // Import the utility function

export const data = new SlashCommandBuilder()
    .setName('replacefile')
    .setDescription('Replace an existing file with a new one')
    .addStringOption(option =>
        option.setName('path')
            .setDescription('The path where the file is located')
            .setRequired(true))
    .addStringOption(option =>
        option.setName('oldfilename')
            .setDescription('The name of the file to be replaced')
            .setRequired(true))
    .addAttachmentOption(option =>
        option.setName('file')
            .setDescription('The new file to upload')
            .setRequired(true))
    .addStringOption(option =>
        option.setName('newfilename')
            .setDescription('The name of the new file')
            .setRequired(false));

export async function execute(interaction, FileManagementSystem) {
    const oldFileName = interaction.options.getString('oldfilename');
    let pathOption = interaction.options.getString('path') || ''; // Default to an empty string
    const newFileName = interaction.options.getString('newfilename') || oldFileName;
    const attachment = interaction.options.getAttachment('file');

    try {
        pathOption = await validatePath(interaction, FileManagementSystem, pathOption);

        // Search for the message containing the file to be replaced
        const messageToDelete = await searchForFileInServer(interaction.guild, oldFileName);

        // If the message is found, delete it
        if (messageToDelete) {
            await messageToDelete.delete();
            interaction.followUp({ content: `Message containing the file "${oldFileName}" has been deleted.`, ephemeral: true });
        } else {
            return interaction.reply({ content: `File "${oldFileName}" not found in the server.`, ephemeral: true });
        }

        // Adjust the file structure
        FileManagementSystem.replaceFile(pathOption, oldFileName, newFileName, attachment.url);
        return interaction.reply({ content: `File "${oldFileName}" replaced successfully with "${newFileName}" at path "${pathOption}".`, ephemeral: true });
    } catch (error) {
        console.error(error);
    }
}
