import { SlashCommandBuilder } from 'discord.js';
import { validatePath } from '../utils/validatePath.js';
import { searchForFileInServer } from '../utils/searchForFileInServer.js';

export const data = new SlashCommandBuilder()
    .setName('replacefile')
    .setDescription('Replace an existing file with a new one')
    .addStringOption(option =>
        option.setName('path')
            .setDescription('The path where the file is located [Example: "/folder/subfolder1/subfolder2"]')
            .setRequired(true))
    .addStringOption(option =>
        option.setName('oldfilename')
            .setDescription('The name of the file to be replaced [Example: "oldfile.txt"]')
            .setRequired(true))
    .addAttachmentOption(option =>
        option.setName('file')
            .setDescription('The new file to replace the existing file')
            .setRequired(true))
    .addStringOption(option =>
        option.setName('newfilename')
            .setDescription('The name of the new file {Default is the old file name} [Example: "newfile.txt"]')
            .setRequired(false));

export async function execute(interaction, FileManagementSystem) {
    let pathOption = interaction.options.getString('path');
    const oldFileName = interaction.options.getString('oldfilename');
    const newFileName = interaction.options.getString('newfilename') || oldFileName;
    const attachment = interaction.options.getAttachment('file');

    try {
        pathOption = await validatePath(interaction, FileManagementSystem, pathOption);

        if (!FileManagementSystem.isOwner(validPath, oldFileName, owner)) {
            return interaction.reply({ content: 'You do not have permission to replace this file.', ephemeral: true });
        }

        const messageToDelete = await searchForFileInServer(interaction.guild, oldFileName);

        if (messageToDelete) {
            await messageToDelete.delete();
            interaction.followUp({ content: `Message containing the file "${oldFileName}" has been deleted.`, ephemeral: true });
        } else {
            return interaction.reply({ content: `File "${oldFileName}" not found in the server.`, ephemeral: true });
        }

        FileManagementSystem.replaceFile(pathOption, oldFileName, newFileName, attachment.url);
        return interaction.reply({ content: `File "${oldFileName}" replaced successfully with "${newFileName}" at path "${pathOption}".`, ephemeral: true });
    } catch (error) {
        console.error(error);
    }
}
