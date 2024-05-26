import { SlashCommandBuilder } from 'discord.js';

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

export async function execute(interaction, fileSystem, saveFileSystem) {
    const folderName = interaction.options.getString('foldername');
    const pathOption = interaction.options.getString('path') || '';
    const paths = pathOption.split('/').filter(Boolean);
    const attachments = interaction.options.getAttachment('file') ? interaction.options.getAttachment('file') : interaction.message.attachments;
    let current = fileSystem;

    for (const p of paths) {
        if (!current[p] || current[p].type !== 'folder') {
            return interaction.reply({ content: `Path "${pathOption}" does not exist.`, ephemeral: true });
        }
        current = current[p].children;
    }

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
