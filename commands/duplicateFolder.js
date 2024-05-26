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

export async function execute(interaction, fileSystem, saveFileSystem) {
    const sourcePath = interaction.options.getString('sourcepath').split('/').filter(Boolean);
    const destinationPath = (interaction.options.getString('destinationpath') || '').split('/').filter(Boolean);
    const newFolderName = interaction.options.getString('newfoldername');
    const folderName = sourcePath.pop();
    let currentSource = fileSystem;
    let currentDestination = fileSystem;

    for (const p of sourcePath) {
        if (!currentSource[p] || currentSource[p].type !== 'folder') {
            return interaction.reply({ content: `Source path "${sourcePath.join('/')}" does not exist.`, ephemeral: true });
        }
        currentSource = currentSource[p].children;
    }

    if (!currentSource[folderName] || currentSource[folderName].type !== 'folder') {
        return interaction.reply({ content: `Folder "${folderName}" does not exist at source path "${sourcePath.join('/')}".`, ephemeral: true });
    }

    for (const p of destinationPath) {
        if (!currentDestination[p] || currentDestination[p].type !== 'folder') {
            return interaction.reply({ content: `Destination path "${destinationPath.join('/')}" does not exist.`, ephemeral: true });
        }
        currentDestination = currentDestination[p].children;
    }

    if (currentDestination[newFolderName]) {
        return interaction.reply({ content: `A folder with the name "${newFolderName}" already exists at destination path "${destinationPath.join('/')}".`, ephemeral: true });
    }

    currentDestination[newFolderName] = { ...currentSource[folderName] };
    saveFileSystem();
    return interaction.reply({ content: `Folder "${folderName}" duplicated successfully as "${newFolderName}" at "${destinationPath.join('/')}".`, ephemeral: true });
}
