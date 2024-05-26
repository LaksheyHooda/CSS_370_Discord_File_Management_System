import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
    .setName('allfiles')
    .setDescription('Display your file structure');

export async function execute(interaction, FileManagementSystem) {
    const tree = FileManagementSystem.displayFileSystem();
    return interaction.reply({ content: `\`\`\`\n${tree}\n\`\`\``, ephemeral: true });
}
