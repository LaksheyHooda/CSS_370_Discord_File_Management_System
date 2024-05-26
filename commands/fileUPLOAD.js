import { SlashCommandBuilder } from 'discord.js';
import { validatePath } from '../utils/validatePath.js';

export const data = new SlashCommandBuilder()
    .setName('uploadfiles')
    .setDescription('Insert multiple files into a directory')
    .addAttachmentOption(option =>
        option.setName('files')
            .setDescription('The files to be uploaded')
            .setRequired(true))
    .addStringOption(option =>
        option.setName('path')
            .setDescription('The path where the file(s) should be inserted {Default is root} [Example: "myfolder/subfolder"]')
            .setRequired(false));

export async function execute(interaction, FileManagementSystem) {
    let pathOption = interaction.options.getString('path') || '';
    const attachments = interaction.options.getAttachment('files') ? [interaction.options.getAttachment('files')] : interaction.message.attachments;

    try {
        pathOption = await validatePath(interaction, FileManagementSystem, pathOption);

        const files = [];
        attachments.forEach(attachment => {
            files.push({ owner: interaction.user.id, name: attachment.name, url: attachment.url });
        });

        FileManagementSystem.insertFiles(pathOption, files);
        return interaction.reply({ content: `Files uploaded successfully and inserted to path "${pathOption}".`, ephemeral: true });
    } catch (error) {
        console.error(error);
        interaction.reply({ content: 'An error occurred while inserting the file(s).', ephemeral: true });
    }
}
