import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
    .setName('duplicatefile')
    .setDescription('Duplicate a file to a specified location or root dir by default')
    .addStringOption(option =>
        option.setName('sourcepath')
            .setDescription('The path where the file to be duplicated exists [Example: "/folder/subfolder1/subfolder2"]')
            .setRequired(true))
    .addStringOption(option =>
        option.setName('destinationpath')
            .setDescription('The path where the resulting file will be placed [Example: "/folder/subfolder1/subfolder2"]')
            .setRequired(true))
    .addStringOption(option =>
        option.setName('newfilename')
            .setDescription('The name for the newly created file')
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
