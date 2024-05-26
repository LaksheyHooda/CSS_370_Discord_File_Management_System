import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
    .setName('listfiles')
    .setDescription('List all files within a directory')
    .addStringOption(option =>
        option.setName('path')
            .setDescription('The path to list files from')
            .setRequired (false))
    .addBooleanOption(option =>
        option.setName('full')
            .setDescription('Show all subdirectories and their files')
            .setRequired (false));

export async function execute(interaction, FileManagementSystem) {
    let pathOption = interaction.options.getString('path') || ''; // Default to an empty string
    const fullOption = interaction.options.getBoolean('full') || false; // Default to false

    // Validate the path
    if (!FileManagementSystem.validatePath(pathOption)) {
        return interaction.reply({ content: `The path "${pathOption}" does not exist. Please provide a valid path.`, ephemeral: true });
    }

    const tree = FileManagementSystem.displayDirectory(FileManagementSystem.root, pathOption, 0, [0], fullOption);
    return interaction.reply({ content: `\`\`\`\n${tree}\n\`\`\``, ephemeral: true });
}
