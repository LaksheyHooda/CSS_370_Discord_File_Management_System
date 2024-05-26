import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
    .setName('duplicatefile')
    .setDescription('Duplicate a file to the same or a different location')
    .addStringOption(option =>
        option.setName('newfilename')
            .setDescription('The name for the duplicate file')
            .setRequired(true))
    .addStringOption(option =>
        option.setName('sourcepath')
            .setDescription('The current path of the file')
            .setRequired(true))
    .addStringOption(option =>
        option.setName('destinationpath')
            .setDescription('The path for the duplicate file')
            .setRequired(true));

export async function execute(interaction, FileManagementSystem) {
    const sourcePath = interaction.options.getString('sourcepath');
    const destinationPath = interaction.options.getString('destinationpath');
    const newFileName = interaction.options.getString('newfilename');
    const fileName = sourcePath.split('/').pop();
    const fileNode = FileManagementSystem.searchFile(fileName);

    if (fileNode) {
        FileManagementSystem.createFile(destinationPath, newFileName, fileNode.link);
        return interaction.reply({ content: `File "${fileName}" duplicated successfully as "${newFileName}" at "${destinationPath}".`, ephemeral: true });
    } else {
        return interaction.reply({ content: `File "${fileName}" not found at "${sourcePath}".`, ephemeral: true });
    }
}
