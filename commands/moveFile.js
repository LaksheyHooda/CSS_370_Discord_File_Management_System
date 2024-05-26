import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
    .setName('movefile')
    .setDescription('Move a file to a new location')
    .addStringOption(option =>
        option.setName('sourcepath')
            .setDescription('The current path of the file')
            .setRequired(true))
    .addStringOption(option =>
        option.setName('destinationpath')
            .setDescription('The new path for the file')
            .setRequired(true));

export async function execute(interaction, fileSystem, saveFileSystem) {
    const sourcePath = interaction.options.getString('sourcepath').split('/').filter(Boolean);
    const destinationPath = interaction.options.getString('destinationpath').split('/').filter(Boolean);
    const fileName = sourcePath.pop();
    let currentSource = fileSystem;
    let currentDestination = fileSystem;

    for (const p of sourcePath) {
        if (!currentSource[p] || currentSource[p].type !== 'folder') {
            return interaction.reply({ content: `Source path "${sourcePath.join('/')}" does not exist.`, ephemeral: true });
        }
        currentSource = currentSource[p].children;
    }

    if (!currentSource[fileName]) {
        return interaction.reply({ content: `File "${fileName}" does not exist at source path "${sourcePath.join('/')}".`, ephemeral: true });
    }

    for (const p of destinationPath) {
        if (!currentDestination[p] || currentDestination[p].type !== 'folder') {
            return interaction.reply({ content: `Destination path "${destinationPath.join('/')}" does not exist.`, ephemeral: true });
        }
        currentDestination = currentDestination[p].children;
    }

    currentDestination[fileName] = currentSource[fileName];
    delete currentSource[fileName];
    saveFileSystem();
    return interaction.reply({ content: `File "${fileName}" moved successfully to "${destinationPath.join('/')}".`, ephemeral: true });
}
