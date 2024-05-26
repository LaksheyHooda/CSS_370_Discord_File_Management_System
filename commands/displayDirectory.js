import { SlashCommandBuilder } from 'discord.js';
import { splitMessage } from '../utils/splitMessage.js';
import { validatePath } from '../utils/validatePath.js';

export const data = new SlashCommandBuilder()
    .setName('displaydirectory')
    .setDescription('List all files within a directory from a given path or the root directory by default')
    .addStringOption(option =>
        option.setName('path')
            .setDescription('The path to list files from {Default is root} [Example: "/folder/subfolder1/subfolder2"]')
            .setRequired(false))
    .addBooleanOption(option =>
        option.setName('full')
            .setDescription('List all files contained within all the descending subdirectories {Default is false} [Example: true]')
            .setRequired(false));

export async function execute(interaction, FileManagementSystem) {
    let pathOption = interaction.options.getString('path') || '';
    const fullOption = interaction.options.getBoolean('full') || false;

    pathOption = await validatePath(interaction, FileManagementSystem, pathOption);

    const tree = FileManagementSystem.displayDirectory(FileManagementSystem.root, pathOption, 0, [0], fullOption);
    const messages = splitMessage(`\`\`\`\n${tree}\n\`\`\``);

    await interaction.reply({ content: messages[0], ephemeral: true });

    for (let i = 1; i < messages.length; i++) {
        await interaction.followUp({ content: messages[i], ephemeral: true });
    }
}
