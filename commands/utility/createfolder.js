import { SlashCommandBuilder } from 'discord.js';
import File from '../models/file.js'; // Ensure to import your file model correctly

export const data = new SlashCommandBuilder()
    .setName('createfolder')
    .setDescription('Creates a new folder')
    .addStringOption(option =>
        option.setName('foldername')
            .setDescription('The name of the folder')
            .setRequired(true))
    .addStringOption(option =>
        option.setName('path')
            .setDescription('The path where to create the folder')
            .setRequired(false));

export async function execute(interaction) {
    const folderName = interaction.options.getString('foldername');
    const path = interaction.options.getString('path') || '';

    const existingFolder = await File.findOne({ fileName: folderName, path, type: 'folder' });
    if (existingFolder) {
        return interaction.reply('A folder with that name already exists in the specified path.');
    }

    const newFolder = new File({
        fileName: folderName,
        type: 'folder',
        path: path,
        uploader: interaction.user.username,
        permissions: ['admin', 'moderator']
    });
    await newFolder.save();
    await interaction.reply(`Folder ${folderName} created successfully at path ${path}.`);
}
