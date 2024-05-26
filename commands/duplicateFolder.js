import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
    .setName('duplicatefolder')
    .setDescription('Duplicate a folder to the same or a different location')
    .addStringOption(option =>
        option.setName('sourcepath')
            .setDescription('The current path of the folder')
            .setRequired(true))
    .addStringOption(option =>
        option.setName('newfoldername')
            .setDescription('The name for the duplicate folder')
            .setRequired(true))
    .addStringOption(option =>
        option.setName('destinationpath')
            .setDescription('The path for the duplicate folder')
            .setRequired(false));

export async function execute(interaction, FileManagementSystem) {
    const sourcePath = interaction.options.getString('sourcepath');
    const destinationPath = interaction.options.getString('destinationpath') || '';
    const newFolderName = interaction.options.getString('newfoldername');

    const folderNode = FileManagementSystem.getDirectoryNode(sourcePath.split('/').pop());

    if (folderNode) {
        FileManagementSystem.createFolder(`${destinationPath}/${newFolderName}`);
        for (const child of folderNode.children) {
            FileManagementSystem.createFolder(`${destinationPath}/${newFolderName}/${child.name}`);
            for (const file of child.files) {
                FileManagementSystem.createFile(`${destinationPath}/${newFolderName}/${child.name}`, file.name, file.link);
            }
        }
        return interaction.reply({ content: `Folder "${sourcePath}" duplicated successfully as "${newFolderName}" at "${destinationPath}".`, ephemeral: true });
    } else {
        return interaction.reply({ content: `Folder "${sourcePath}" not found.`, ephemeral: true });
    }
}
