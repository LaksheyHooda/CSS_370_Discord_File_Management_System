import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
    .setName('updatefilestructure')
    .setDescription('Update the file structure (admin only)')
    .addStringOption(option =>
        option.setName('json')
            .setDescription('The new file structure in JSON format')
            .setRequired(true));

export async function execute(interaction, FileManagementSystem) {
    const jsonString = interaction.options.getString('json');
    try {
        const newFileSystem = JSON.parse(jsonString);
        FileManagementSystem.root = newFileSystem;
        return interaction.reply({ content: 'File structure updated successfully.', ephemeral: true });
    } catch (error) {
        return interaction.reply({ content: 'Invalid JSON format.', ephemeral: true });
    }
}
