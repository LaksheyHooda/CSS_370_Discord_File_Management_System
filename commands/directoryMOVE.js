import { SlashCommandBuilder } from 'discord.js';
import { validatePath } from '../utils/validatePath.js';

export const data = new SlashCommandBuilder()
    .setName('movedirectory')
    .setDescription('Move an existing directory to a new location')
    .addStringOption(option =>
        option.setName('oldpath')
            .setDescription('The current path to the directory {Example: "myfolder/subfolder"}')
            .setRequired(true))
    .addStringOption(option =>
        option.setName('newpath')
            .setDescription('The new path for the directory {Example: "newfolder/subfolder"}')
            .setRequired(true));

export async function execute(interaction, FileManagementSystem) {
    let oldPathOption = interaction.options.getString('oldpath');
    let newPathOption = interaction.options.getString('newpath');
    
    const member = interaction.guild.members.cache.get(interaction.user.id);
    const isServerAdmin= member.permissions.has('ADMINISTRATOR');
    if (!isServerAdmin) {
        return interaction.reply({ content: 'You do not have permission to create directories.', ephemeral: true });
    }

    try {
        oldPathOption = await validatePath(interaction, FileManagementSystem, oldPathOption);
        newPathOption = await validatePath(interaction, FileManagementSystem, newPathOption);
        if (oldPathOption === '' || oldPathOption === 'root') {
            return interaction.reply({ content: 'You cannot move the root directory.', ephemeral: true });
        }
        FileManagementSystem.moveDirectory(oldPathOption, newPathOption);
        return interaction.reply({ content: `Directory moved successfully from "${oldPathOption}" to "${newPathOption}".`, ephemeral: true });
    } catch (error) {
        console.error(error);
        interaction.reply({ content: `An error occurred while moving the directory: ${error.message}`, ephemeral: true });
    }
}
