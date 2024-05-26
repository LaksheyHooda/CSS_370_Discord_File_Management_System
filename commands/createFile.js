import { SlashCommandBuilder } from 'discord.js';

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

export async function execute(interaction, fileSystem, saveFileSystem) {
    const fileNameOption = interaction.options.getString('filename');
    const pathOption = interaction.options.getString('path') || '';
    const attachments = interaction.options.getAttachment('file') ? interaction.options.getAttachment('file') : interaction.message.attachments;
    const paths = pathOption.split('/').filter(Boolean);
    let current = fileSystem;

    for (const p of paths) {
        if (!current[p] || current[p].type !== 'folder') {
            return interaction.reply({ content: `Path "${pathOption}" does not exist.`, ephemeral: true });
        }
        current = current[p].children;
    }

    if (attachments.size === 1) {
        const attachment = attachments.first();
        const fileName = fileNameOption || attachment.name;

        if (current[fileName]) {
            return interaction.reply({ content: `A file with the name "${fileName}" already exists at path "${pathOption}".`, ephemeral: true });
        }

        current[fileName] = { type: 'file', url: attachment.url };
        saveFileSystem();
        return interaction.reply({ content: `File "${fileName}" created successfully at path "${pathOption}" with the attachment.`, ephemeral: true });
    } else {
        const folderName = fileNameOption || `NewFolder_${Date.now()}`;
        if (current[folderName]) {
            return interaction.reply({ content: `A folder with the name "${folderName}" already exists at path "${pathOption}".`, ephemeral: true });
        }

        current[folderName] = { type: 'folder', children: {} };
        const newFolder = current[folderName].children;

        for (const attachment of attachments.values()) {
            newFolder[attachment.name] = { type: 'file', url: attachment.url };
        }

        saveFileSystem();
        return interaction.reply({ content: `Folder "${folderName}" created successfully at path "${pathOption}" with attachments.`, ephemeral: true });
    }
}
