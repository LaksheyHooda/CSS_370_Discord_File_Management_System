import { SlashCommandBuilder } from 'discord.js';
import { splitMessage } from '../utils/splitMessage.js'; // Import the utility function

export const data = new SlashCommandBuilder()
    .setName('displayfiles')
    .setDescription('Display your server file structure and all the files uploaded to this server');

export async function execute(interaction, FileManagementSystem) {
    const tree = FileManagementSystem.displayFileSystem();
    const messages = splitMessage(`\`\`\`\n${tree}\n\`\`\``);

    await interaction.reply({ content: messages[0], ephemeral: true });

    for (let i = 1; i < messages.length; i++) {
        await interaction.followUp({ content: messages[i], ephemeral: true });
    }
}
